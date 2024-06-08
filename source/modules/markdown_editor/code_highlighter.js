class CodeHighlighter extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          .function-keyword {
            color: blue;
          }
          .keyword {
            color: green;
          }
          #code {
            white-space: pre-wrap;
          }
        </style>
        <div id="code"></div>
      `;
      this.codeElement = this.shadowRoot.getElementById('code');
      this.highlightSyntax('');
    }
  
    get code() {
      return this.codeElement.innerText;
    }

    set code(value) {
      this.highlightSyntax(value);
    }

    escapeHtml(html) {
      var text = document.createTextNode(html);
      var div = document.createElement('div');
      div.appendChild(text);
      return div.innerHTML;
    }

    highlightSyntax(code) {
      var keywords = ['function', 'const', 'let', 'var', 'return'];

      code = this.escapeHtml(code);

      keywords.forEach(keyword => {
        var regex = new RegExp('\\b' + keyword + '\\b', 'g');
        if (keyword === 'function') {
          code = code.replace(regex, '<span class="function-keyword">' + keyword + '</span>');
        } else {
          code = code.replace(regex, '<span class="keyword">' + keyword + '</span>');
        }
      });

      this.codeElement.innerHTML = code.replace(/\n/g, '<br>');
    }

    saveCaretPosition(context) {
      var selection = window.getSelection();
      var range = selection.getRangeAt(0);
      range.setStart(context, 0);
      var len = range.toString().length;

      return () => {
        var pos = this.getTextNodeAtPosition(context, len);
        selection.removeAllRanges();
        var newRange = new Range();
        newRange.setStart(pos.node, pos.position);
        selection.addRange(newRange);
      }
    }

    getTextNodeAtPosition(root, index) {
      const NODE_TYPE = NodeFilter.SHOW_TEXT;
      var treeWalker = document.createTreeWalker(root, NODE_TYPE, elem => {
        if (index > elem.textContent.length) {
          index -= elem.textContent.length;
          return NodeFilter.FILTER_REJECT
        }
        return NodeFilter.FILTER_ACCEPT;
      });
      var currentNode = treeWalker.nextNode();
      return {
        node: currentNode ? currentNode : root,
        position: index
      };
    }

    handleInput(event) {
      var keyCode = event.keyCode || event.which;
      if (keyCode === 13) { 
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        var br = document.createElement('br');
        range.deleteContents(); 
        range.insertNode(br); 
        range.setStartAfter(br); 
        range.collapse(true);
        event.preventDefault();
        return;
      }
      var restore = this.saveCaretPosition(this.codeElement);
      this.highlightSyntax();
      restore();
    }
  }

  customElements.define('code-highlighter', CodeHighlighter);
