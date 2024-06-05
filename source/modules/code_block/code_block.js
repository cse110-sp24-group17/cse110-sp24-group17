document.addEventListener('DOMContentLoaded', function() {
  function escapeHtml(html) {
    var text = document.createTextNode(html);
    var div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
  }

  function highlightSyntax() {
    var codeElement = document.getElementById('code');
    var code = codeElement.innerText;
    var keywords = ['function', 'const', 'let', 'var', 'return'];

    code = escapeHtml(code);

    // replace keywords with highlighted spans
    keywords.forEach(function(keyword) {
      var regex = new RegExp('\\b' + keyword + '\\b', 'g');
      if (keyword === 'function') {
        code = code.replace(regex, '<span class="function-keyword">' + keyword + '</span>');
      } else {
        code = code.replace(regex, '<span class="keyword">' + keyword + '</span>');
      }
    });

    codeElement.innerHTML = code.replace(/\n/g, '<br>');
  }

  // save the cursor position
  function saveCaretPosition(context) {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    range.setStart(context, 0);
    var len = range.toString().length;

    return function restore() {
      var pos = getTextNodeAtPosition(context, len);
      selection.removeAllRanges();
      var newRange = new Range();
      newRange.setStart(pos.node, pos.position);
      selection.addRange(newRange);
    }
  }

  function getTextNodeAtPosition(root, index) {
    const NODE_TYPE = NodeFilter.SHOW_TEXT;
    var treeWalker = document.createTreeWalker(root, NODE_TYPE, function next(elem) {
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

  var codeElement = document.getElementById('code');
  codeElement.addEventListener('input', function(event) {
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
    var restore = saveCaretPosition(this);
    highlightSyntax();
    restore();
  });
  highlightSyntax();
});
