import {
  BlockLinkInlineNode,
  LinkInlineNode,
  ParagraphNode,
  parseInlineExpression,
} from "../../source/modules/models/mdast";

test("parses plain text correctly", () => {
  const parent = {};
  const text = "Hello, world!";
  const result = parseInlineExpression(parent, text);

  expect(result.length).toBe(1);
  expect(result[0].getType()).toBe("text");
  expect(result[0].getRawContent()).toBe("Hello, world!");
});

test("parses bold text correctly", () => {
  const parent = {};
  const text = "This is **bold** text.";
  const result = parseInlineExpression(parent, text);

  expect(result.length).toBe(3);
  expect(result[0].getType()).toBe("text");
  expect(result[0].getRawContent()).toBe("This is ");

  expect(result[1].getType()).toBe("bold");
  expect(result[1].children.length).toBe(1);
  expect(result[1].children[0].getRawContent()).toBe("bold");

  expect(result[2].getType()).toBe("text");
  expect(result[2].getRawContent()).toBe(" text.");
});

test("parses italic text correctly", () => {
  const parent = {};
  const text = "This is *italic* text.";
  const result = parseInlineExpression(parent, text);

  expect(result.length).toBe(3);
  expect(result[0].getType()).toBe("text");
  expect(result[0].getRawContent()).toBe("This is ");

  expect(result[1].getType()).toBe("italic");
  expect(result[1].children.length).toBe(1);
  expect(result[1].children[0].getRawContent()).toBe("italic");

  expect(result[2].getType()).toBe("text");
  expect(result[2].getRawContent()).toBe(" text.");
});

test("parses bold italic text correctly", () => {
  const parent = {};
  const text = "This is ** *bold and italic* ** text.";
  const result = parseInlineExpression(parent, text);

  expect(result.length).toBe(3);
  expect(result[0].getType()).toBe("text");
  expect(result[0].getRawContent()).toBe("This is ");

  expect(result[1].getType()).toBe("bold");
  expect(result[1].children.length).toBe(3);
  expect(result[1].children[1].getType()).toBe("italic");

  expect(result[2].getType()).toBe("text");
  expect(result[2].getRawContent()).toBe(" text.");
});

test("Simple text node", () => {
  const parsedNodes = parseInlineExpression(null, "Hello World");
  const paragraphNode = new ParagraphNode(parsedNodes);
  expect(paragraphNode.getRawContent()).toBe("Hello World");
});

test("Bold text", () => {
  const parsedNodes = parseInlineExpression(null, "Hello **Bold Text**");
  const paragraphNode = new ParagraphNode(parsedNodes);
  expect(paragraphNode.getRawContent()).toBe("Hello **Bold Text**");
});

test("Italic text", () => {
  const parsedNodes = parseInlineExpression(null, "Hello *Italic Text*");
  const paragraphNode = new ParagraphNode(parsedNodes);
  expect(paragraphNode.getRawContent()).toBe("Hello *Italic Text*");
});

test("Nested bold and italic text", () => {
  const parsedNodes = parseInlineExpression(
    null,
    "Hello **Nested *Italic* Text**",
  );
  const paragraphNode = new ParagraphNode(parsedNodes);
  expect(paragraphNode.getRawContent()).toBe("Hello **Nested *Italic* Text**");
});

test("Mixed text", () => {
  const parsedNodes = parseInlineExpression(
    null,
    "Hello **Bold *Italic*** and plain",
  );
  const paragraphNode = new ParagraphNode(parsedNodes);
  expect(paragraphNode.getRawContent()).toBe(
    "Hello **Bold *Italic*** and plain",
  );
});

test("Link node", () => {
  const parsedNodes = parseInlineExpression(
    null,
    "This is a [link](https://example.com)",
  );
  const paragraphNode = new ParagraphNode(parsedNodes);
  const linkNode = parsedNodes.find((node) => node instanceof LinkInlineNode);

  expect(paragraphNode.getRawContent()).toBe(
    "This is a [link](https://example.com)",
  );
  expect(linkNode).toBeDefined();
  expect(linkNode.getType()).toBe("link");
  expect(linkNode.getRawContent()).toBe("[link](https://example.com)");
  expect(linkNode.url).toBe("https://example.com");
});

test("Block link node", () => {
  const parsedNodes = parseInlineExpression(null, "This is a [[block link]]");
  const paragraphNode = new ParagraphNode(parsedNodes);
  const blockLinkNode = parsedNodes.find(
    (node) => node instanceof BlockLinkInlineNode,
  );

  expect(paragraphNode.getRawContent()).toBe("This is a [[block link]]");
  expect(blockLinkNode).toBeDefined();
  expect(blockLinkNode.getType()).toBe("block_link");
  expect(blockLinkNode.getRawContent()).toBe("[[block link]]");
});
