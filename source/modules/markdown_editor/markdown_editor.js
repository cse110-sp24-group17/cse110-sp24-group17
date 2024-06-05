import { ParagraphNode, TextInlineNode, lower_to_dom, parse_inline_expression, parse_markdown } from "../models/mdast.js";
import App from "../models/app.js";

const replaceLog = (log) => {
  log = log.replace('\u200B', '*');
  return log;
}

class MarkdownEditorComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .markdown-container {
          display: flex;
          height: 100%;
          width: 100%;
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
        }
        #preview {
          width: 100%;
          height: 100%;
          overflow: auto;
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

  get file() {
    return this._file;
  }

  set file(value) {
    this._file = value;
    this.editor.innerText = this._file.get_content();
    this.preview.innerHTML = '';
    this.parse(this.preview, this._file.get_content(), false);
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
    lower_to_dom(parent, node, syntax);
  }

  setup() {
    const editor = document.querySelector("#editor");
    this.editor = editor;

    const preview = document.querySelector("#preview");
    this.preview = preview;

    editor.addEventListener("input", (e) => {
      let input = this.editor.innerText;
      // const pos = this.getCurPos(this.editor);
      // this.setInput(input, pos);
      this.preview.innerHTML = '';
      this.parse(this.preview, input, false);
      this.file.set_content(input);
      App.store.sync();
    });

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
}

customElements.define("markdown-editor", MarkdownEditorComponent);
