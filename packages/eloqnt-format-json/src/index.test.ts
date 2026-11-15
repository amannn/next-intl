import {expect, it} from 'vite-plus/test';
import createJsonCodec from './index.js';

type Message = ReturnType<ReturnType<typeof createJsonCodec>['decode']>[number];

// The patterns measured in the wild plus the ambiguity traps — mirrors the
// Crowdin stress test from docs/research/2026-08-17-non-string-catalog-values.md.
const stress = {
  plainString: 'A plain string',
  stringArray: ['First item', 'Second item', 'Third item'],
  objectArray: [
    {question: 'First question?', answer: 'First answer'},
    {question: 'Second question?', answer: 'Second answer'}
  ],
  mixedArray: ['A string', 42, true, {nested: 'An object inside'}],
  nestedArrays: [['Inner one', 'Inner two'], ['Inner three']],
  booleanTrue: true,
  booleanFalse: false,
  integerValue: 42,
  floatValue: 3.14,
  numericKeyObject: {0: 'Zero as an object key', 1: 'One as an object key'},
  sparseNumericObject: {1: 'One without a zero sibling'},
  'dotted.key': 'A key with a literal dot',
  'bracketKey[0]': 'A literal key that looks like an index',
  deep: {nesting: {holds: ['Deeply nested item']}},
  prototype: 'A key named prototype',
  // A computed key creates an own property — a literal `__proto__:` would
  // set the prototype instead.
  ['__proto__']: 'A key named proto'
};

function encodeBack(
  codec: ReturnType<typeof createJsonCodec>,
  messages: Array<Message>
): string {
  return codec.encode(messages, {
    locale: 'en',
    sourceMessagesById: new Map()
  });
}

it('round-trips every non-string pattern from the stress file byte for byte', () => {
  const codec = createJsonCodec();
  const content = JSON.stringify(stress, null, 2) + '\n';
  const messages = codec.decode(content, {locale: 'en', sourceLocale: 'en'});
  expect(encodeBack(codec, messages)).toBe(content);
});

it('decodes array elements with numeric segments and numeric object keys with string segments', () => {
  const codec = createJsonCodec();
  const messages = codec.decode(
    '{"items": ["a"], "object": {"0": "b"}, "elements": [{"label": "c"}]}',
    {locale: 'en', sourceLocale: 'en'}
  );
  expect(messages).toEqual([
    expect.objectContaining({
      id: 'items.0',
      message: 'a',
      segments: ['items', 0]
    }),
    expect.objectContaining({
      id: 'object.0',
      message: 'b',
      segments: ['object', '0']
    }),
    expect.objectContaining({
      id: 'elements.0.label',
      message: 'c',
      segments: ['elements', 0, 'label']
    })
  ]);
});

it('decodes booleans and numbers as verbatim values, never as text', () => {
  const codec = createJsonCodec();
  const messages = codec.decode('{"flag": true, "limit": 42}', {
    locale: 'en',
    sourceLocale: 'en'
  });
  expect(messages).toEqual([
    expect.objectContaining({id: 'flag', verbatim: {value: true}}),
    expect.objectContaining({id: 'limit', verbatim: {value: 42}})
  ]);
});

it('treats null as absent but reproduces it on the file it came from', () => {
  const codec = createJsonCodec();
  const content = '{\n  "title": "Hi",\n  "pending": null\n}\n';
  const messages = codec.decode(content, {locale: 'en', sourceLocale: 'en'});
  expect(messages.map(({id}) => id)).toEqual(['title']);
  expect(JSON.parse(encodeBack(codec, messages))).toEqual({
    title: 'Hi',
    pending: null
  });
});

it('reproduces empty arrays and objects on encode', () => {
  const codec = createJsonCodec();
  const messages = codec.decode('{"empty": [], "blank": {}}', {
    locale: 'en',
    sourceLocale: 'en'
  });
  expect(messages).toEqual([]);
  expect(JSON.parse(encodeBack(codec, messages))).toEqual({
    empty: [],
    blank: {}
  });
});

it('writes a target array it never decoded, inheriting structure from the source', () => {
  const source = createJsonCodec();
  const sourceMessages = source.decode(
    '{"items": ["One", "Two"], "object": {"0": "Zero"}}',
    {locale: 'en', sourceLocale: 'en'}
  );
  const sourceMessagesById = new Map(
    sourceMessages.map((message) => [message.id, message])
  );

  // A fresh target file: the merge rebuilds translations without segments, so
  // encode must take the shape from the source messages.
  const target = createJsonCodec();
  const written = target.encode(
    [
      {id: 'items.0', message: 'Eins', description: [], references: []},
      {id: 'items.1', message: 'Zwei', description: [], references: []},
      {id: 'object.0', message: 'Null', description: [], references: []}
    ],
    {locale: 'de', sourceMessagesById}
  );
  expect(JSON.parse(written)).toEqual({
    items: ['Eins', 'Zwei'],
    object: {0: 'Null'}
  });
});

it('resolves a structure conflict toward the source shape on write', () => {
  const source = createJsonCodec();
  const sourceMessages = source.decode('{"a": ["One", "Two"]}', {
    locale: 'en',
    sourceLocale: 'en'
  });
  const sourceMessagesById = new Map(
    sourceMessages.map((message) => [message.id, message])
  );

  // The target held `a` as a plain string; writing the translated elements
  // follows the source's structure and the conflicting leaf is dropped.
  const target = createJsonCodec();
  const targetMessages = target.decode('{"a": "left over"}', {
    locale: 'de',
    sourceLocale: 'en'
  });
  const written = target.encode(
    [
      ...targetMessages,
      {id: 'a.0', message: 'Eins', description: [], references: []},
      {id: 'a.1', message: 'Zwei', description: [], references: []}
    ],
    {locale: 'de', sourceMessagesById}
  );
  expect(JSON.parse(written)).toEqual({a: ['Eins', 'Zwei']});
});

it('treats keys that collide with Object.prototype members as plain messages', () => {
  const codec = createJsonCodec();
  const content = [
    '{',
    '  "prototype": "a",',
    '  "nested": {',
    '    "constructor": "b",',
    '    "__proto__": "c"',
    '  },',
    '  "__proto__": {',
    '    "deep": "d"',
    '  }',
    '}'
  ].join('\n');

  const messages = codec.decode(content, {locale: 'en', sourceLocale: 'en'});
  expect(messages.map(({id, message}) => ({id, message}))).toEqual([
    {id: 'prototype', message: 'a'},
    {id: 'nested.constructor', message: 'b'},
    {id: 'nested.__proto__', message: 'c'},
    {id: '__proto__.deep', message: 'd'}
  ]);

  // If `__proto__` had set a prototype instead of landing as a data property,
  // `JSON.stringify` would drop it and the round-trip would come up short.
  expect(encodeBack(codec, messages)).toBe(content + '\n');
});

it('sorts encoded messages by their first source reference', () => {
  const codec = createJsonCodec();
  const output = codec.encode(
    [
      {
        id: 'b',
        message: 'B',
        description: [],
        references: [{path: 'src/z.tsx', line: 1}]
      },
      {
        id: 'a',
        message: 'A',
        description: [],
        references: [{path: 'src/a.tsx', line: 2}]
      }
    ],
    {locale: 'en', sourceMessagesById: new Map()}
  );
  expect(Object.keys(JSON.parse(output))).toEqual(['a', 'b']);
});

it('keeps decoded order for messages without references', () => {
  const codec = createJsonCodec();
  const decoded = codec.decode('{\n  "z": "Z",\n  "a": "A"\n}\n', {
    locale: 'en',
    sourceLocale: 'en'
  });
  const output = codec.encode(decoded, {
    locale: 'en',
    sourceMessagesById: new Map()
  });
  expect(Object.keys(JSON.parse(output))).toEqual(['z', 'a']);
});

it('treats a blank file as an empty catalog', () => {
  const codec = createJsonCodec();
  expect(codec.decode('\n', {locale: 'fr', sourceLocale: 'en'})).toEqual([]);
  const output = codec.encode(
    [{id: 'title', message: '', description: [], references: []}],
    {locale: 'fr', sourceMessagesById: new Map()}
  );
  expect(output).toBe('{\n  "title": ""\n}\n');
});
