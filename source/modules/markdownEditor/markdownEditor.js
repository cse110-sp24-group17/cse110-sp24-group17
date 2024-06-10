import {
  EditorProtocol,
  lowerToDom,
  parseMarkdown,
} from "../models/mdast.js";
import App from "../models/app.js";

class MarkdownEditorProtocol extends EditorProtocol {
  constructor() {
    super();
    this._filename = null;
    this._loaded = false;
  }

  getContent(filename) {
    const file = App.store.getFile(filename);
    if (file) {
      return file.getContent();
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
          height: calc(100% - 40px);
          width: calc(100% - 40px);
          padding: 20px;
        }

        .markdown-divide {
          width: 1px;
          height: 100%;
          background-color: #ccc;
        }

        .markdown-section {
          flex: 1;
          padding: 10px;
          overflow: hidden;
          height: calc(100% - 20px);
        }

        #editor {
          display: block;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          white-space: pre-wrap;
          font-size: 1.5em;

          border: none;
          outline: none;

          -webkit-box-shadow: none;
          -moz-box-shadow: none;
          box-shadow: none;

          resize: none;
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
          <textarea id="editor"></textarea>
        </div>
        <div class="markdown-divide"></div>
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
    const file = App.getFileStore().getFile(value);
    if (file) {
      this._loaded = true;
      this.file = file;
      this.editor.value = this.file.getContent();
      this.preview.innerHTML = "";
      this.parse(this.preview, this.file.getContent(), false);
    } else {
      this.editor.value = "";
      this.preview.innerHTML = "";
    }
  }

  getCursorPosition(parent, node, offset, stat) {
    if (stat.done) return stat;

    let currentNode = null;
    if (parent.childNodes.length === 0) {
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
        if (parent.textContent.includes("\u200B")) {
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

    this.preview.innerHTML = "";
    this.parse(this.preview, input, false);

    this.editor.innerHTML = "";
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
    const node = parseMarkdown(text);
    const protocol = new MarkdownEditorProtocol();
    lowerToDom(parent, node, protocol, syntax);
  }

  setup() {
    const editor = document.querySelector("#editor");
    this.editor = editor;

    const preview = document.querySelector("#preview");
    this.preview = preview;

    editor.addEventListener("input", () => {
      if (!this._loaded) {
        this._loaded = true;
        this.file = App.getFileStore().createFile(this._filename);
      }
      let input = this.editor.value;
      // const pos = this.getCurPos(this.editor);
      // this.setInput(input, pos);
      this.preview.innerHTML = "";
      this.parse(this.preview, input, false);
      this.file.setContent(input);
      App.store.sync();
      if (this.onSave) {
        this.onSave();
      }
    });

    window.gotoMarkdown = (path) => {
      const file = App.store.getFile(path);
      if (file) {
        App.openFile(path);
      }
    };

    this.setupDragAndDrop(editor);
  }

  setupDragAndDrop(editor) {
    editor.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    editor.addEventListener("drop", async (event) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        const content = await App.compressImage(file, 800);
        const img = App.store.createFile(file.name);
        img.setContent(content);
        document.execCommand(
          "insertText",
          false,
          "![image](" + img.getPath() + ")",
        );
      }
    });
  }
}

customElements.define("markdown-editor", MarkdownEditorComponent);
