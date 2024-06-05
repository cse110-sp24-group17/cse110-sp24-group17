import { BlockLinkInlineNode, LinkInlineNode, ParagraphNode, parse_inline_expression } from "./mdast";

test('parses plain text correctly', () => {
  const parent = {};
  const text = 'Hello, world!';
  const result = parse_inline_expression(parent, text);

  expect(result.length).toBe(1);
  expect(result[0].get_type()).toBe('text');
  expect(result[0].get_raw_content()).toBe('Hello, world!');
});

test('parses bold text correctly', () => {
  const parent = {};
  const text = 'This is **bold** text.';
  const result = parse_inline_expression(parent, text);

  expect(result.length).toBe(3);
  expect(result[0].get_type()).toBe('text');
  expect(result[0].get_raw_content()).toBe('This is ');

  expect(result[1].get_type()).toBe('bold');
  expect(result[1].children.length).toBe(1);
  expect(result[1].children[0].get_raw_content()).toBe('bold');

  expect(result[2].get_type()).toBe('text');
  expect(result[2].get_raw_content()).toBe(' text.');
});

test('parses italic text correctly', () => {
  const parent = {};
  const text = 'This is *italic* text.';
  const result = parse_inline_expression(parent, text);

  expect(result.length).toBe(3);
  expect(result[0].get_type()).toBe('text');
  expect(result[0].get_raw_content()).toBe('This is ');

  expect(result[1].get_type()).toBe('italic');
  expect(result[1].children.length).toBe(1);
  expect(result[1].children[0].get_raw_content()).toBe('italic');

  expect(result[2].get_type()).toBe('text');
  expect(result[2].get_raw_content()).toBe(' text.');
});

test('parses bold italic text correctly', () => {
  const parent = {};
  const text = 'This is ** *bold and italic* ** text.';
  const result = parse_inline_expression(parent, text);

  expect(result.length).toBe(3);
  expect(result[0].get_type()).toBe('text');
  expect(result[0].get_raw_content()).toBe('This is ');

  expect(result[1].get_type()).toBe('bold');
  expect(result[1].children.length).toBe(3);
  expect(result[1].children[1].get_type()).toBe('italic');

  expect(result[2].get_type()).toBe('text');
  expect(result[2].get_raw_content()).toBe(' text.');
});

test('Simple text node', () => {
  const parsedNodes = parse_inline_expression(null, 'Hello World');
  const paragraphNode = new ParagraphNode(parsedNodes);
  expect(paragraphNode.get_raw_content()).toBe('Hello World');
});

test('Bold text', () => {
  const parsedNodes = parse_inline_expression(null, 'Hello **Bold Text**');
  const paragraphNode = new ParagraphNode(parsedNodes);
  expect(paragraphNode.get_raw_content()).toBe('Hello **Bold Text**');
});

test('Italic text', () => {
  const parsedNodes = parse_inline_expression(null, 'Hello *Italic Text*');
  const paragraphNode = new ParagraphNode(parsedNodes);
  expect(paragraphNode.get_raw_content()).toBe('Hello *Italic Text*');
});

test('Nested bold and italic text', () => {
  const parsedNodes = parse_inline_expression(null, 'Hello **Nested *Italic* Text**');
  const paragraphNode = new ParagraphNode(parsedNodes);
  expect(paragraphNode.get_raw_content()).toBe('Hello **Nested *Italic* Text**');
});

test('Mixed text', () => {
  const parsedNodes = parse_inline_expression(null, 'Hello **Bold *Italic*** and plain');
  const paragraphNode = new ParagraphNode(parsedNodes);
  expect(paragraphNode.get_raw_content()).toBe('Hello **Bold *Italic*** and plain');
});

test('Link node', () => {
  const parsedNodes = parse_inline_expression(null, 'This is a [link](https://example.com)');
  const paragraphNode = new ParagraphNode(parsedNodes);
  const linkNode = parsedNodes.find(node => node instanceof LinkInlineNode);

  expect(paragraphNode.get_raw_content()).toBe('This is a [link](https://example.com)');
  expect(linkNode).toBeDefined();
  expect(linkNode.get_type()).toBe('link');
  expect(linkNode.get_raw_content()).toBe('[link](https://example.com)');
  expect(linkNode.url).toBe('https://example.com');
});

test('Block link node', () => {
  const parsedNodes = parse_inline_expression(null, 'This is a [[block link]]');
  const paragraphNode = new ParagraphNode(parsedNodes);
  const blockLinkNode = parsedNodes.find(node => node instanceof BlockLinkInlineNode);

  expect(paragraphNode.get_raw_content()).toBe('This is a [[block link]]');
  expect(blockLinkNode).toBeDefined();
  expect(blockLinkNode.get_type()).toBe('block_link');
  expect(blockLinkNode.get_raw_content()).toBe('[[block link]]');
});
