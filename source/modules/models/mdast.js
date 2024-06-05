/**
 * Markdown syntax tree data structure
 *
 * Parse Markdown text into syntax tree so that it's easier to manipulate
 *
 * Only basic specifications are implemented as the time period for this
 * project is relatively short, but following we tried to implement the spec 
 * below as accurate as possible.
 *
 * https://spec.commonmark.org/0.31.2
 *
 * Two types of the nodes:
 *  Block - equivalent to html block display
 *  Inline - equivalent to thml inline display
 *
 * Markdown document is sequence of blocks each block consisting of 
 * some inline elements
 *
 * Each block node contains a 
 *
 * @module mdast
 */

class BlockNode {
  constructor() {
    this.children = [];
  }

  get_raw_content() {
    throw new Error("Unimplemented raw content");
  }

  get_type() {
    throw new Error("Unimplemented type");
  }

  lower_to_dom(cursor_contained) {
    throw new Error("Unimplemented lower to dom");
  }
}

export class ListItemNode extends BlockNode {
  constructor(type, level) {
    super();
    this.type = type;
    this.level = level;
  }
}

export class InlineNode {
  constructor(parent) {
    this.parent = parent;
    this.children = [];      
  }

  get_raw_content() {
    throw new Error("Unimplemented raw content");
  }

  cursor_contained(cur, offset) {
    const len = this.get_raw_content().length;
    return offset >= cur && offset <= cur + len;
  }

  get_type() {
    throw new Error("Unimplemented type");
  }

  lower_to_dom(syntax) {
    throw new Error("Unimplemented lower to dom");
  }
}

function create_span_element(text) {
  const node = document.createElement('span');
  node.textContent = text;
  return node;
}

export class TextInlineNode extends InlineNode {
  constructor(parent, text) {
    super(parent);
    this.text = text;
  }

  get_raw_content() {
    return this.text;
  }
  
  get_type() {
    return 'text';
  }

  lower_to_dom(syntax) {
    const node = document.createElement('span');
    node.textContent = this.text;
    return node;
  }
}

export class DecorationInlineNode extends InlineNode {
  constructor(parent, paren, children) {
    super(parent);
    this.paren = paren;
    this.children = children;
  }

  get_raw_content() {
    let res = this.paren[0];
    for (const child of this.children) {
      res += child.get_raw_content();
    }
    res += this.paren[1];
    return res;
  }
  
  get_type() {
    return 'bold';
  }

  lower_to_dom(syntax) {
    const node = document.createElement('b');
    if (syntax)
      node.appendChild(create_span_element(this.paren[0]));
    for (const child of this.children) {
      node.appendChild(child.lower_to_dom(syntax));
    }
    if (syntax)
      node.appendChild(create_span_element(this.paren[1]));
    return node;
  }
}

export class BracketInlineNode extends DecorationInlineNode {
  constructor(parent, children) {
    super(parent, ['[',']'], children);
  }
  get_type() {
    return 'bracket';
  }

  lower_to_dom(syntax) {
    const node = document.createElement('span');
    const left = document.createElement('span');
    left.textContent = '[';
    node.appendChild(left);
    for (const child of this.children) {
      node.appendChild(child.lower_to_dom(syntax));
    }
    const right = document.createElement('span');
    right.textContent = ']';
    node.appendChild(right);
    return node;
  }
}

export class BoldInlineNode extends DecorationInlineNode {
  constructor(parent, children) {
    super(parent, ['**','**'], children);
  }
  get_type() {
    return 'bold';
  }

  lower_to_dom(syntax) {
    const node = document.createElement('b');
    if (syntax)
      node.appendChild(create_span_element(this.paren[0]));
    for (const child of this.children) {
      node.appendChild(child.lower_to_dom(syntax));
    }
    if (syntax)
      node.appendChild(create_span_element(this.paren[1]));
    return node;
  }
}


export class ItalicInlineNode extends DecorationInlineNode {
  constructor(parent, children) {
    super(parent, ['*','*'], children);
  }
  get_type() {
    return 'italic';
  }

  lower_to_dom(syntax) {
    const node = document.createElement('i');
    if (syntax)
      node.appendChild(create_span_element(this.paren[0]));
    for (const child of this.children) {
      node.appendChild(child.lower_to_dom(syntax));
    }
    if (syntax)
      node.appendChild(create_span_element(this.paren[1]));
    return node;
  }
}

export class ParenInlineNode extends DecorationInlineNode {
  constructor(parent, children) {
    super(parent, ['(',')'], children);
  }
  get_type() {
    return 'paren';
  }

  lower_to_dom(syntax) {
    const node = document.createElement('span');
    const left = document.createElement('span');
    left.textContent = '(';
    node.appendChild(left);
    for (const child of this.children) {
      node.appendChild(child.lower_to_dom(syntax));
    }
    const right = document.createElement('span');
    right.textContent = ')';
    node.appendChild(right);
    return node;
  }
}

export class LinkInlineNode extends InlineNode {
  constructor(parent, children, url) {
    super(parent);
    this.children = children;
    this.url = url;
  }

  get_raw_content() {
    let res = '[';
    for (const child of this.children) {
      res += child.get_raw_content();
    }
    res += '](' + this.url + ')';
    return res;
  }

  get_type() {
    return 'link';
  }

  lower_to_dom(syntax) {
    const node = document.createElement('span');
    node.href = this.url;
    if (syntax)
      node.appendChild(create_span_element('['));
    const node2 = document.createElement('a');
    node2.href = this.url;
    for (const child of this.children) {
      node2.appendChild(child.lower_to_dom(syntax));
    }
    node.appendChild(node2);
    if (syntax)
      node.appendChild(create_span_element(`](${this.url})`));
    return node;
  }
}

export class BlockLinkInlineNode extends DecorationInlineNode {
  constructor(parent, children) {
    super(parent, ['[[',']]'], children);
  }

  get_type() {
    return 'block_link';
  }

  lower_to_dom(syntax) {
    const node = document.createElement('span');
    node.appendChild(create_span_element('[['));
    for (const child of this.children) {
      node.appendChild(child.lower_to_dom(syntax));
    }
    node.appendChild(create_span_element(']]'));
    return node;
  }
}

export function parse_inline_expression(parent, text) {
  let stack = [[new TextInlineNode(parent, ''),false]];
  let parenBuilders = [
    ['**', '**', BoldInlineNode],
    ['*', '*', ItalicInlineNode],
    ['[[', ']]', BlockLinkInlineNode],
    ['[', ']', BracketInlineNode],
    ['(', ')', ParenInlineNode],
  ];
  const countMap = {};
  for (const x of parenBuilders) {
    countMap[x[0]] = 0;
  }
  let cur = 0;
  const tryConsumeCombo = (char, limit) => {
    let last = cur;
    let cnt = 0;
    while (cur < text.length) {
      if (text[cur] !== char) {
        break;
      }
      cur++;
      cnt++;
      if (cnt === limit) {
        break;
      }
    }
    cur = last;
    return cnt;
  };
  const compareTextNode = (node, text) => {
    return node.get_type() === 'text' && node.get_raw_content() === text;
  };
  const collapseStack = (paren) => {
    let res = [];
    while (!(stack[stack.length-1][1] && compareTextNode(stack[stack.length-1][0], paren))) {
      const item = stack[stack.length-1];
      if (item[1]) {
        countMap[item[0].get_raw_content()]--;
      }
      res.push(stack[stack.length - 1][0]);
      stack.pop();
    }
    countMap[paren]--;
    res.reverse();
    stack.pop();
    return res;
  };
  while (cur < text.length) {
    let matched = false;
    for (const [open, close, cls] of parenBuilders) {
      // match close first to not miss the case where open and close are the same
      let cnt = tryConsumeCombo(close[0], close.length);
      if (cnt === close.length) {
        if (countMap[open]) {
          const children = collapseStack(open);
          stack.push([new cls(parent, children), false]);
          cur += cnt;
          matched = true;
          break;
        }
      }
      // now we can match open
      cnt = tryConsumeCombo(open[0], open.length);
      if (cnt === open.length) {
        countMap[open]++;
        stack.push([new TextInlineNode(parent, open), true]);
        stack.push([new TextInlineNode(parent, ''), false]);
        cur += cnt;
        matched = true;
        break;
      }
    }
    if (matched) {
      // pasrse link expresiosn
      // [children](text url)
      if (stack[stack.length-1][0].get_type() === 'paren' && stack.length >= 2){
        const last = stack[stack.length-1][0];
        const secondLast = stack[stack.length-2][0];
        if (secondLast.get_type() === 'bracket' 
          && last.children.length === 1 && last.children[0].get_type() === 'text') {
          stack.pop();
          stack.pop();
          stack.push([new LinkInlineNode(parent, secondLast.children, last.children[0].get_raw_content()), false]);
        }
      }
      continue;
    }
    if (stack[stack.length-1][0].get_type() !== 'text') {
      stack.push([new TextInlineNode(parent, ''), false]);
    }
    stack[stack.length-1][0].text += text[cur];
    cur ++;
  }
  return stack.map(x => x[0]);
}

export class EmptyLineNode extends BlockNode {
  constructor() {
    super();
  }

  get_raw_content() {
    return '\n';
  }

  lower_to_dom(syntax) {
    if (syntax) {
      const ret = create_fake_br();
      return ret;
    } else {
      return document.createElement('span');
    }
  }
}

export class HeaderNode extends BlockNode {
  constructor(level, children) {
    super();
    this.level = level;
    this.children = children;
  }

  get_raw_content() {
    let res = '';
    for (const child of this.children) {
      res += child.get_raw_content();
    }
    return res;
  }

  lower_to_dom(syntax) {
    const node = document.createElement('h' + this.level);
    for (let i=0; i<this.children.length; i++) {
      const child = this.children[i];
      node.appendChild(child.lower_to_dom(syntax));
    }
    return node;
  }
}

export class CodeBlockNode extends BlockNode {
  constructor(content) {
    super();
    this.content = content;
  }

  get_raw_content() {
    return content;
  }

  lower_to_dom(syntax) {
    const node = document.createElement('code-highlighter');
    node.code = this.content;
    return node;
  }
}


export class ParagraphNode extends BlockNode {
  constructor(children) {
    super();
    this.children = children;
  }

  get_raw_content() {
    let res = '';
    for (const child of this.children) {
      res += child.get_raw_content();
    }
    return res;
  }

  lower_to_dom(syntax, last) {
    const node = document.createElement('div');
    // if (this.get_raw_content() === '') {
    //   node.appendChild(document.createElement('br'));
    //   return node;
    // }
    for (let i=0; i<this.children.length; i++) {
      const child = this.children[i];
      node.appendChild(child.lower_to_dom(syntax));
    }
    // if (!last) {
    //   node.appendChild(document.createElement('br'));
    // }
    return node;
  }
}

export function parse_block(text) {
  let cur = 0;
  const tryConsumeCombo = (char, limit) => {
    let last = cur;
    let cnt = 0;
    while (cur < text.length) {
      if (text[cur] !== char) {
        break;
      }
      cur++;
      cnt++;
      if (cnt === limit) {
        break;
      }
    }
    cur = last;
    return cnt;
  };
  const cnt = tryConsumeCombo('#', -1);
  if (cnt > 0) {
    return new HeaderNode(cnt, parse_inline_expression(null, text.substring(cnt)));
  }
  return new ParagraphNode(parse_inline_expression(null, text));
}

export function parse_markdown(text) {
  const blocks = [];
  const lines = text.split('\n'); // split by \r\n or \n
  let inCodeBlock = false;
  let curCodeBlock = '';
  for (const line of lines) {
    if (line === "```") {
      if (inCodeBlock) {
        console.log(curCodeBlock);
        blocks.push(new CodeBlockNode(curCodeBlock));
        curCodeBlock = '';
      } 
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) {
      curCodeBlock += line + '\n\n';
      continue;
    }
    blocks.push(parse_block(line));
  }
  if (curCodeBlock !== '') {
    blocks.push(new ParagraphNode(parse_inline_expression(null, '```')));
    curCodeBlock.split('\n').forEach((line, index) => {
      blocks.push(parse_block(line));
    });
  }
  console.log(blocks);
  return blocks;
}

export function lower_to_dom(parent, blocks, syntax) {
  for (let i=0; i<blocks.length; i++) {
    const block = blocks[i];
    parent.appendChild(block.lower_to_dom(syntax, i === blocks.length - 1));
  }
}

