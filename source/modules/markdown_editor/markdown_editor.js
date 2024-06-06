import { EditorProtocol, ParagraphNode, TextInlineNode, lower_to_dom, parse_inline_expression, parse_markdown } from "../models/mdast.js";
import App from "../models/app.js";

class MarkdownEditorProtocol extends EditorProtocol {
  constructor() {
    super();
    this._filename = null;
    this._loaded = false;
  }

  get_content(filename) {
    const file = App.store.get_file(filename);
    if (file) {
      return file.get_content();
    }
    return undefined;
  }
}

class MarkdownEditorComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .markdown-container {
          display: flex;
          height: 100%;
          width: 100%;
          padding:10px;
        }
        .markdown-section {
          flex: 1;
          overflow: hidden;
          height: 100%;
        }

        #editor {
          display: block;
          width: 100%;
          height: 100%;
          overflow: auto;
          white-space: pre;
          font-size: 1.5em;
        }

        #editor:focus {
          outline: none;
        }

        #preview {
          width: 100%;
          height: 100%;
          font-size: 1.5em;
          overflow: auto;
        }

        #preview h1 {
          font-size: 2em;
        }
        #preview h2 {
          font-size: 1.5em;
        }
        #preview h3 {
          font-size: 1.17em;
        }
        #preview h4 {
          font-size: 1em;
        }
        #preview h5 {
          font-size: 0.83em;
        }
        #preview h6 {
          font-size: 0.67em;
        }
        #preview p {
          margin: 0;
        }
        #preview ul {
          padding-left: 20px;
        }
        #preview ul li {
          list-style-type: disc;
        }
        #preview img {
          max-width: 90%;
          height: auto;
        }
      </style>
      <div class="markdown-container">
        <div class="markdown-section">
          <div id="editor" contenteditable="true"></div>
        </div>
        <div class="markdown-section">
          <div id="preview"></div>
        </div>
      </div>
    `;
    this.setup();
  }

  get filename() {
    return this._filename;
  }

  set filename(value) {
    this._filename = value;
    this._loaded = false;
    const file = App.get_file_store().get_file(value);
    if (file) {
      this._loaded = true;
      this.file = file;
      this.editor.innerText = this.file.get_content();
      this.preview.innerHTML = '';
      this.parse(this.preview, this.file.get_content(), false);
    } else {
      this.editor.innerText = '';
      this.preview.innerHTML = '';
    }
  }

  getCursorPosition(parent, node, offset, stat) {
    if (stat.done) return stat;

    let currentNode = null;
    if (parent.childNodes.length == 0) {
      stat.pos += parent.textContent.length;
    } else {
      for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
        currentNode = parent.childNodes[i];
        if (currentNode === node) {
          stat.pos += offset;
          stat.done = true;
          return stat;
        } else this.getCursorPosition(currentNode, node, offset, stat);
      }
    }
    return stat;
  }

  setCursorPosition(parent, range, stat) {
    if (stat.done) return range;

    if (parent.childNodes.length === 0) {
      if (parent.textContent.length >= stat.pos) {
        if (parent.textContent.includes('\u200B')) {
          range.setStart(parent, Math.ceil(stat.pos));
        } else {
          range.setStart(parent, Math.floor(stat.pos));
        }
        stat.done = true;
      } else {
        stat.pos = stat.pos - parent.textContent.length;
      }
    } else {
      for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
        this.setCursorPosition(parent.childNodes[i], range, stat);
      }
    }
    return range;
  }

  getCurPos(parent) {
    let sel = window.getSelection();
    const node = sel.focusNode;
    const offset = sel.focusOffset;
    const pos = this.getCursorPosition(parent, node, offset, {
      pos: 0,
      done: false,
    });
    if (offset === 0) pos.pos += 0.5;
    return pos.pos;
  }

  setInput(input, pos) {
    let sel = window.getSelection();

    this.preview.innerHTML = '';
    this.parse(this.preview, input, false);

    this.editor.innerHTML = '';
    this.parse(this.editor, input, true);

    sel.removeAllRanges();
    sel = window.getSelection();
    const range = this.setCursorPosition(this.editor, document.createRange(), {
      pos: pos,
      done: false,
    });
    range.collapse(true);
    sel.addRange(range);
  }

  parse(parent, text, syntax) {
    const node = parse_markdown(text);
    const protocol = new MarkdownEditorProtocol();
    lower_to_dom(parent, node, protocol, syntax);
  }

  setup() {
    const editor = document.querySelector("#editor");
    this.editor = editor;

    const preview = document.querySelector("#preview");
    this.preview = preview;

    editor.addEventListener("input", (e) => {
      if (!this._loaded) {
        this._loaded = true;
        this.file = App.get_file_store().create_file(this._filename);
      }
      let input = this.editor.innerText;
      // const pos = this.getCurPos(this.editor);
      // this.setInput(input, pos);
      this.preview.innerHTML = '';
      this.parse(this.preview, input, false);
      this.file.set_content(input);
      App.store.sync();
      if (this.onSave) {
        this.onSave();
      }
    });

    window.gotoMarkdown = (path) => {
      const file = App.store.get_file(path);
      if (file) {
        this.file = file;
      }
    }

    this.setupDragAndDrop(editor);

    // editor.addEventListener("keydown", (e) => {
    //   if (e.which === 13) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //
    //     let pos = this.getCurPos(editor);
    //     let cur = 0;
    //     let ptr = 0;
    //     let found;
    //     for (const node of editor.childNodes) {
    //       console.log(node.textContent, cur, pos);
    //       if (cur + node.textContent.length >= pos)  {
    //         pos -= cur;
    //         found = node;
    //         break;
    //       }
    //       cur += node.textContent.length;
    //       ptr++;
    //     }
    //     let blocks = parse_markdown(editor.innerText);
    //     if (found.innerText.length === pos) {
    //       blocks.splice(ptr+1, 0, new ParagraphNode([]));
    //       editor.innerHTML = '';
    //       lower_to_dom(editor, blocks, true);
    //
    //       const range = document.createRange();
    //       range.setStart(editor.childNodes[ptr+1], 0);
    //       range.collapse(true);
    //       const sel = window.getSelection();
    //       sel.removeAllRanges();
    //       sel.addRange(range);
    //     } else {
    //       const text = found.innerText;
    //       const left = text.slice(0, pos);
    //       const right = text.slice(pos);
    //       blocks[ptr] = new ParagraphNode([new TextInlineNode(null, left)]);
    //       blocks.splice(ptr+1, 0, new ParagraphNode([new TextInlineNode(null, right)]));
    //       editor.innerHTML = '';
    //       lower_to_dom(editor, blocks, true);
    //       let newTree = parse_markdown(editor.innerText);
    //       editor.innerHTML = '';
    //       lower_to_dom(editor, newTree, true);
    //       const range = document.createRange();
    //       range.setStart(editor.childNodes[ptr+1], 0);
    //       range.collapse(true);
    //       const sel = window.getSelection();
    //       sel.removeAllRanges();
    //       sel.addRange(range);
    //     }
    //
    //     // const input = editor.innerText;
    //     // const text = input.slice(0, pos) + '\n' + input.slice(pos);
    //     // this.setInput(text, pos);
    //     // editor.innerText = text;
    //   }
    // });
  }
  
  setupDragAndDrop(editor) {
    editor.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    editor.addEventListener("drop", (event) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const img = App.store.create_file(file.name);
          img.set_content(content);
          document.execCommand("insertText", false, "![image](" + img.get_path() + ")");
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

customElements.define("markdown-editor", MarkdownEditorComponent);
