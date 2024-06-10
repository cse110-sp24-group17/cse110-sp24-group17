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

export class EditorProtocol {
  constructor() {
    this.dom = document.createElement("div");
  }

  getContent(filename) {
    throw new Error("Unimplemented get content");
  }
}

class BlockNode {
  constructor() {
    this.children = [];
  }

  getRawContent() {
    throw new Error("Unimplemented raw content");
  }

  getType() {
    throw new Error("Unimplemented type");
  }

  lowerToDom(protocol, syntax) {
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

  getRawContent() {
    throw new Error("Unimplemented raw content");
  }

  cursor_contained(cur, offset) {
    const len = this.getRawContent().length;
    return offset >= cur && offset <= cur + len;
  }

  getType() {
    throw new Error("Unimplemented type");
  }

  lowerToDom(protocol, syntax) {
    throw new Error("Unimplemented lower to dom");
  }
}

function createSpanElement(text) {
  const node = document.createElement("span");
  node.textContent = text;
  return node;
}

export class TextInlineNode extends InlineNode {
  constructor(parent, text) {
    super(parent);
    this.text = text;
  }

  getRawContent() {
    return this.text;
  }

  getType() {
    return "text";
  }

  lowerToDom(protocol, syntax) {
    const node = document.createElement("span");
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

  getRawContent() {
    let res = this.paren[0];
    for (const child of this.children) {
      res += child.getRawContent();
    }
    res += this.paren[1];
    return res;
  }

  getType() {
    return "bold";
  }

  lowerToDom(protocol, syntax) {
    const node = document.createElement("b");
    if (syntax) node.appendChild(createSpanElement(this.paren[0]));
    for (const child of this.children) {
      node.appendChild(child.lowerToDom(protocol, syntax));
    }
    if (syntax) node.appendChild(createSpanElement(this.paren[1]));
    return node;
  }
}

export class BracketInlineNode extends DecorationInlineNode {
  constructor(parent, children) {
    super(parent, ["[", "]"], children);
  }
  getType() {
    return "bracket";
  }

  lowerToDom(protocol, syntax) {
    const node = document.createElement("span");
    const left = document.createElement("span");
    left.textContent = "[";
    node.appendChild(left);
    for (const child of this.children) {
      node.appendChild(child.lowerToDom(protocol, syntax));
    }
    const right = document.createElement("span");
    right.textContent = "]";
    node.appendChild(right);
    return node;
  }
}

export class BoldInlineNode extends DecorationInlineNode {
  constructor(parent, children) {
    super(parent, ["**", "**"], children);
  }
  getType() {
    return "bold";
  }

  lowerToDom(protocol, syntax) {
    const node = document.createElement("b");
    if (syntax) node.appendChild(createSpanElement(this.paren[0]));
    for (const child of this.children) {
      node.appendChild(child.lowerToDom(protocol, syntax));
    }
    if (syntax) node.appendChild(createSpanElement(this.paren[1]));
    return node;
  }
}

export class ItalicInlineNode extends DecorationInlineNode {
  constructor(parent, children) {
    super(parent, ["*", "*"], children);
  }
  getType() {
    return "italic";
  }

  lowerToDom(protocol, syntax) {
    const node = document.createElement("i");
    if (syntax) node.appendChild(createSpanElement(this.paren[0]));
    for (const child of this.children) {
      node.appendChild(child.lowerToDom(protocol, syntax));
    }
    if (syntax) node.appendChild(createSpanElement(this.paren[1]));
    return node;
  }
}

export class ParenInlineNode extends DecorationInlineNode {
  constructor(parent, children) {
    super(parent, ["(", ")"], children);
  }
  getType() {
    return "paren";
  }

  lowerToDom(protocl, syntax) {
    const node = document.createElement("span");
    const left = document.createElement("span");
    left.textContent = "(";
    node.appendChild(left);
    for (const child of this.children) {
      node.appendChild(child.lowerToDom(protocl, syntax));
    }
    const right = document.createElement("span");
    right.textContent = ")";
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

  getRawContent() {
    let res = "[";
    for (const child of this.children) {
      res += child.getRawContent();
    }
    res += "](" + this.url + ")";
    return res;
  }

  getType() {
    return "link";
  }

  lowerToDom(protocol, syntax) {
    const node = document.createElement("span");
    node.href = this.url;
    if (syntax) node.appendChild(createSpanElement("["));
    const node2 = document.createElement("a");
    node2.href = this.url;
    for (const child of this.children) {
      node2.appendChild(child.lowerToDom(protocol, syntax));
    }
    node.appendChild(node2);
    if (syntax) node.appendChild(createSpanElement(`](${this.url})`));
    return node;
  }
}

export class ImageInlineNode extends InlineNode {
  constructor(parent, children, url) {
    super(parent);
    this.children = children;
    this.url = url;
  }

  getRawContent() {
    let res = "![";
    for (const child of this.children) {
      res += child.getRawContent();
    }
    res += "](" + this.url + ")";
    return res;
  }

  getType() {
    return "link";
  }

  lowerToDom(protocol, syntax) {
    const node = document.createElement("span");
    if (syntax) node.appendChild(createSpanElement("!["));
    const node2 = document.createElement("img");
    const content = protocol.getContent(this.url);
    if (content) {
      node2.src = content;
    }
    node.appendChild(node2);
    if (syntax) node.appendChild(createSpanElement(`](${this.url})`));
    return node;
  }
}

export class BlockLinkInlineNode extends DecorationInlineNode {
  constructor(parent, children) {
    super(parent, ["[[", "]]"], children);
  }

  getType() {
    return "block_link";
  }

  lowerToDom(protocol, syntax) {
    const node = document.createElement("a");
    node.href = "#";
    for (const child of this.children) {
      node.appendChild(child.lowerToDom(protocol, syntax));
    }
    node.addEventListener("click", (e) => {
      e.preventDefault();
      window.gotoMarkdown(this.children[0].getRawContent());
    });
    return node;
  }
}

export function parseInlineExpression(parent, text) {
  let stack = [[new TextInlineNode(parent, ""), false]];
  let parenBuilders = [
    ["**", "**", BoldInlineNode],
    ["*", "*", ItalicInlineNode],
    ["[[", "]]", BlockLinkInlineNode],
    ["[", "]", BracketInlineNode],
    ["(", ")", ParenInlineNode],
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
    return node.getType() === "text" && node.getRawContent() === text;
  };
  const collapseStack = (paren) => {
    let res = [];
    while (
      !(
        stack[stack.length - 1][1] &&
        compareTextNode(stack[stack.length - 1][0], paren)
      )
    ) {
      const item = stack[stack.length - 1];
      if (item[1]) {
        countMap[item[0].getRawContent()]--;
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
        stack.push([new TextInlineNode(parent, ""), false]);
        cur += cnt;
        matched = true;
        break;
      }
    }
    if (matched) {
      // pasrse link expresiosn
      // [children](text url)
      if (
        stack[stack.length - 1][0].getType() === "paren" &&
        stack.length >= 2
      ) {
        const last = stack[stack.length - 1][0];
        const secondLast = stack[stack.length - 2][0];
        if (
          secondLast.getType() === "bracket" &&
          last.children.length === 1 &&
          last.children[0].getType() === "text"
        ) {
          if (stack.length >= 3) {
            const thirdLast = stack[stack.length - 3][0];
            if (
              thirdLast.getType() === "text" &&
              thirdLast.text[thirdLast.text.length - 1] === "!"
            ) {
              thirdLast.text = thirdLast.text.substring(
                0,
                thirdLast.text.length - 1,
              );
              stack.pop();
              stack.pop();
              stack.push([
                new ImageInlineNode(
                  parent,
                  secondLast.children,
                  last.children[0].getRawContent(),
                ),
                false,
              ]);
              continue;
            }
          }
          stack.pop();
          stack.pop();
          stack.push([
            new LinkInlineNode(
              parent,
              secondLast.children,
              last.children[0].getRawContent(),
            ),
            false,
          ]);
        }
      }
      continue;
    }
    if (stack[stack.length - 1][0].getType() !== "text") {
      stack.push([new TextInlineNode(parent, ""), false]);
    }
    stack[stack.length - 1][0].text += text[cur];
    cur++;
  }
  return stack.map((x) => x[0]);
}

export class EmptyLineNode extends BlockNode {
  getRawContent() {
    return "\n";
  }

  lowerToDom(protocol, syntax) {
    return document.createElement("span");
  }
}

export class HeaderNode extends BlockNode {
  constructor(level, children) {
    super();
    this.level = level;
    this.children = children;
  }

  getRawContent() {
    let res = "";
    for (const child of this.children) {
      res += child.getRawContent();
    }
    return res;
  }

  lowerToDom(protocol, syntax) {
    const node = document.createElement("h" + this.level);
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      node.appendChild(child.lowerToDom(protocol, syntax));
    }
    return node;
  }
}

export class CodeBlockNode extends BlockNode {
  constructor(content) {
    super();
    this.content = content;
  }

  getRawContent() {
    return this.content;
  }

  lowerToDom(protocol, syntax) {
    const node = document.createElement("code-highlighter");
    node.code = this.content;
    return node;
  }
}

export class ParagraphNode extends BlockNode {
  constructor(children) {
    super();
    this.children = children;
  }

  getRawContent() {
    let res = "";
    for (const child of this.children) {
      res += child.getRawContent();
    }
    return res;
  }

  lowerToDom(protocol, syntax) {
    const node = document.createElement("div");
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      node.appendChild(child.lowerToDom(protocol, syntax));
    }
    return node;
  }
}

export function parseBlock(text) {
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
  const cnt = tryConsumeCombo("#", -1);
  if (cnt > 0) {
    return new HeaderNode(
      cnt,
      parseInlineExpression(null, text.substring(cnt)),
    );
  }
  return new ParagraphNode(parseInlineExpression(null, text));
}

export function parseMarkdown(text) {
  const blocks = [];
  const lines = text.split("\n"); // split by \r\n or \n
  let inCodeBlock = false;
  let curCodeBlock = "";
  for (const line of lines) {
    if (line === "```") {
      if (inCodeBlock) {
        blocks.push(new CodeBlockNode(curCodeBlock));
        curCodeBlock = "";
      }
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) {
      curCodeBlock += line + "\n\n";
      continue;
    }
    blocks.push(parseBlock(line));
  }
  if (curCodeBlock !== "") {
    blocks.push(new ParagraphNode(parseInlineExpression(null, "```")));
    curCodeBlock.split("\n").forEach((line, index) => {
      blocks.push(parseBlock(line));
    });
  }
  return blocks;
}

export function lowerToDom(parent, blocks, protocol, syntax) {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    parent.appendChild(
      block.lowerToDom(protocol, syntax, i === blocks.length - 1),
    );
  }
}
