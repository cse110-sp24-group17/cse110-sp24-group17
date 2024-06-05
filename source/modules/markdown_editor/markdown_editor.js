import { ParagraphNode, lower_to_dom, parse_inline_expression, parse_markdown } from "../models/mdast.js";
import { App } from "../models/app.js";

const replaceLog = (log) => {
  log = log.replace('\u200B', '*');
  return log;
}

class MarkdownEditorComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
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

  get filename() {
    return this._filename;
  }

  set filename(value) {
    this._filename = value;
    this.file = App.store.get_file(this._filename);
    this.editor.innerText = this.file.content;
  }

  getCursorPosition(parent, node, offset, stat) {
    if (stat.done) return stat;

    let currentNode = null;
    if (parent.childNodes.length == 0) {
      stat.pos += parent.textContent.length - cnt;
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

  getCurPos() {
    let sel = window.getSelection();
    const node = sel.focusNode;
    const offset = sel.focusOffset;
    const pos = this.getCursorPosition(this.editor, node, offset, {
      pos: 0,
      done: false,
    });
    if (offset === 0) pos.pos += 0.5;
    return pos.pos;
  }

  setInput(input, pos) {
    this.preview.innerHTML = '';
    this.parse(this.preview, input, false);
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
      let input = editor.innerText;
      this.setInput(input, null);
      this.file.set_content(input);
      App.store.sync();
    });
  }
}

customElements.define("markdown-editor", MarkdownEditorComponent);
