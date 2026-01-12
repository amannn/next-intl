import {describe, expect, it} from 'vitest';
import {compile} from '../src/compiler.js';
import {format} from '../src/format.js';

describe('static text', () => {
  it('handles empty string', () => {
    const compiled = compile('');
    expect(compiled).toMatchInlineSnapshot(`""`);
    expect(format(compiled, 'en')).toMatchInlineSnapshot(`""`);
  });

  it('handles plain text', () => {
    const compiled = compile('Hello world');
    expect(compiled).toMatchInlineSnapshot(`"Hello world"`);
    expect(format(compiled, 'en')).toMatchInlineSnapshot(`"Hello world"`);
  });

  it('handles whitespace', () => {
    const compiled = compile('  Hello  world  ');
    expect(compiled).toMatchInlineSnapshot(`"  Hello  world  "`);
    expect(format(compiled, 'en')).toMatchInlineSnapshot(`"  Hello  world  "`);
  });

  it('handles unicode content', () => {
    const compiled = compile('こんにちは 🌍');
    expect(compiled).toMatchInlineSnapshot(`"こんにちは 🌍"`);
    expect(format(compiled, 'en')).toMatchInlineSnapshot(`"こんにちは 🌍"`);
  });
});

describe('escaping', () => {
  it('escapes single brace', () => {
    const compiled = compile("'{'");
    expect(compiled).toMatchInlineSnapshot(`"{"`);
    expect(format(compiled, 'en')).toMatchInlineSnapshot(`"{"`);
  });

  it('escapes closing brace', () => {
    const compiled = compile("'}'");
    expect(compiled).toMatchInlineSnapshot(`"}"`);
    expect(format(compiled, 'en')).toMatchInlineSnapshot(`"}"`);
  });

  it('escapes braces around text', () => {
    const compiled = compile("'{name}'");
    expect(compiled).toMatchInlineSnapshot(`"{name}"`);
    expect(format(compiled, 'en')).toMatchInlineSnapshot(`"{name}"`);
  });

  it('escapes single quotes', () => {
    const compiled = compile("It''s working");
    expect(compiled).toMatchInlineSnapshot(`"It's working"`);
    expect(format(compiled, 'en')).toMatchInlineSnapshot(`"It's working"`);
  });

  it('handles mixed escaped and unescaped', () => {
    const compiled = compile("'{name}' is {name}");
    expect(compiled).toMatchInlineSnapshot(`
        [
          "{name} is ",
          [
            "name",
          ],
        ]
      `);
    expect(format(compiled, 'en', {name: 'test'})).toMatchInlineSnapshot(
      `"{name} is test"`
    );
  });
});

describe('simple arguments', () => {
  it('formats single argument', () => {
    const compiled = compile('{name}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "name",
          ],
        ]
      `);
    expect(format(compiled, 'en', {name: 'World'})).toMatchInlineSnapshot(
      `"World"`
    );
  });

  it('formats text with argument', () => {
    const compiled = compile('Hello {name}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          "Hello ",
          [
            "name",
          ],
        ]
      `);
    expect(format(compiled, 'en', {name: 'World'})).toMatchInlineSnapshot(
      `"Hello World"`
    );
  });

  it('formats multiple arguments', () => {
    const compiled = compile('{first} {last}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "first",
          ],
          " ",
          [
            "last",
          ],
        ]
      `);
    expect(
      format(compiled, 'en', {first: 'John', last: 'Doe'})
    ).toMatchInlineSnapshot(`"John Doe"`);
  });

  it('converts numbers to strings', () => {
    const compiled = compile('Value: {val}');
    expect(format(compiled, 'en', {val: 42})).toMatchInlineSnapshot(
      `"Value: 42"`
    );
  });

  it('converts booleans to strings', () => {
    const compiled = compile('Active: {active}');
    expect(format(compiled, 'en', {active: true})).toMatchInlineSnapshot(
      `"Active: true"`
    );
  });

  it('throws for missing argument', () => {
    const compiled = compile('Hello {name}');
    expect(() => format(compiled, 'en', {})).toThrow(
      'Missing value for argument "name"'
    );
  });
});

describe('number formatting', () => {
  it('formats plain number', () => {
    const compiled = compile('{val, number}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "val",
            4,
            "number",
          ],
        ]
      `);
    expect(format(compiled, 'en', {val: 1234.5})).toMatchInlineSnapshot(
      `"1,234.5"`
    );
  });

  it('formats percent', () => {
    const compiled = compile('{val, number, percent}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "val",
            4,
            "number",
            "percent",
          ],
        ]
      `);
    expect(format(compiled, 'en', {val: 0.75})).toMatchInlineSnapshot(`"75%"`);
  });

  it('formats integer', () => {
    const compiled = compile('{val, number, integer}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "val",
            4,
            "number",
            "integer",
          ],
        ]
      `);
    expect(format(compiled, 'en', {val: 3.7})).toMatchInlineSnapshot(`"4"`);
  });

  it('throws for non-number value', () => {
    const compiled = compile('{val, number}');
    expect(() => format(compiled, 'en', {val: 'abc'})).toThrow(
      'Expected number for "val", got string'
    );
  });
});

describe('date formatting', () => {
  const date = new Date('2024-03-15T14:30:00Z');

  it('formats date with short style', () => {
    const compiled = compile('{d, date, short}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "d",
            4,
            "date",
            "short",
          ],
        ]
      `);
    const result = format(compiled, 'en', {d: date});
    expect(result).toContain('3');
    expect(result).toContain('15');
  });

  it('formats date with medium style', () => {
    const compiled = compile('{d, date, medium}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "d",
            4,
            "date",
            "medium",
          ],
        ]
      `);
    const result = format(compiled, 'en', {d: date});
    expect(result).toContain('Mar');
  });
});

describe('time formatting', () => {
  const date = new Date('2024-03-15T14:30:00Z');

  it('formats time with short style', () => {
    const compiled = compile('{t, time, short}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "t",
            4,
            "time",
            "short",
          ],
        ]
      `);
    const result = format(compiled, 'en', {t: date});
    expect(typeof result).toBe('string');
  });
});

describe('select', () => {
  it('selects matching branch', () => {
    const compiled = compile(
      '{gender, select, female {She} male {He} other {They}}'
    );
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "gender",
            1,
            {
              "female": "She",
              "male": "He",
              "other": "They",
            },
          ],
        ]
      `);
    expect(format(compiled, 'en', {gender: 'female'})).toMatchInlineSnapshot(
      `"She"`
    );
    expect(format(compiled, 'en', {gender: 'male'})).toMatchInlineSnapshot(
      `"He"`
    );
  });

  it('falls back to other', () => {
    const compiled = compile(
      '{gender, select, female {She} male {He} other {They}}'
    );
    expect(format(compiled, 'en', {gender: 'unknown'})).toMatchInlineSnapshot(
      `"They"`
    );
  });

  it('formats arguments in branches', () => {
    const compiled = compile(
      '{gender, select, female {{name} is a woman} other {{name} is a person}}'
    );
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "gender",
            1,
            {
              "female": [
                [
                  "name",
                ],
                " is a woman",
              ],
              "other": [
                [
                  "name",
                ],
                " is a person",
              ],
            },
          ],
        ]
      `);
    expect(
      format(compiled, 'en', {gender: 'female', name: 'Alice'})
    ).toMatchInlineSnapshot(`"Alice is a woman"`);
  });

  it('throws for select without other', () => {
    expect(() => compile('{gender, select, female {She} male {He}}')).toThrow(
      'MISSING_OTHER_CLAUSE'
    );
  });
});

describe('plural', () => {
  it('formats plural with one/other', () => {
    const compiled = compile('{count, plural, one {# item} other {# items}}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "count",
            2,
            {
              "one": [
                0,
                " item",
              ],
              "other": [
                0,
                " items",
              ],
            },
          ],
        ]
      `);
    expect(format(compiled, 'en', {count: 1})).toMatchInlineSnapshot(
      `"1 item"`
    );
    expect(format(compiled, 'en', {count: 5})).toMatchInlineSnapshot(
      `"5 items"`
    );
    expect(format(compiled, 'en', {count: 0})).toMatchInlineSnapshot(
      `"0 items"`
    );
  });

  it('uses exact matches over plural rules', () => {
    const compiled = compile(
      '{count, plural, =0 {no items} =1 {one item} one {# item} other {# items}}'
    );
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "count",
            2,
            {
              "=0": "no items",
              "=1": "one item",
              "one": [
                0,
                " item",
              ],
              "other": [
                0,
                " items",
              ],
            },
          ],
        ]
      `);
    expect(format(compiled, 'en', {count: 0})).toMatchInlineSnapshot(
      `"no items"`
    );
    expect(format(compiled, 'en', {count: 1})).toMatchInlineSnapshot(
      `"one item"`
    );
    expect(format(compiled, 'en', {count: 2})).toMatchInlineSnapshot(
      `"2 items"`
    );
  });

  it('formats pound sign with locale', () => {
    const compiled = compile('{count, plural, one {# item} other {# items}}');
    expect(format(compiled, 'de', {count: 1000})).toMatchInlineSnapshot(
      `"1.000 items"`
    );
  });

  it('throws for plural without other', () => {
    expect(() => compile('{count, plural, one {item}}')).toThrow(
      'MISSING_OTHER_CLAUSE'
    );
  });

  it('throws for non-number value', () => {
    const compiled = compile('{count, plural, one {# item} other {# items}}');
    expect(() => format(compiled, 'en', {count: 'abc'})).toThrow(
      'Expected number for plural argument "count", got string'
    );
  });
});

describe('ordinal plural (selectordinal)', () => {
  it('formats ordinals in English', () => {
    const compiled = compile(
      '{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'
    );
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "n",
            3,
            {
              "few": [
                0,
                "rd",
              ],
              "one": [
                0,
                "st",
              ],
              "other": [
                0,
                "th",
              ],
              "two": [
                0,
                "nd",
              ],
            },
          ],
        ]
      `);
    expect(format(compiled, 'en', {n: 1})).toMatchInlineSnapshot(`"1st"`);
    expect(format(compiled, 'en', {n: 2})).toMatchInlineSnapshot(`"2nd"`);
    expect(format(compiled, 'en', {n: 3})).toMatchInlineSnapshot(`"3rd"`);
    expect(format(compiled, 'en', {n: 4})).toMatchInlineSnapshot(`"4th"`);
    expect(format(compiled, 'en', {n: 11})).toMatchInlineSnapshot(`"11th"`);
    expect(format(compiled, 'en', {n: 21})).toMatchInlineSnapshot(`"21st"`);
  });
});

describe('tags', () => {
  it('calls tag handler with children', () => {
    const compiled = compile('<bold>important</bold>');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "bold",
            "important",
          ],
        ]
      `);
    const result = format(compiled, 'en', {
      bold: (chunks) => `<b>${chunks.join('')}</b>`
    });
    expect(result).toMatchInlineSnapshot(`"<b>important</b>"`);
  });

  it('handles empty tag', () => {
    const compiled = compile('<br></br>');
    // Empty tags get an empty string child to distinguish from simple arguments
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "br",
            "",
          ],
        ]
      `);
    const result = format(compiled, 'en', {
      br: () => '<br/>'
    });
    expect(result).toMatchInlineSnapshot(`"<br/>"`);
  });

  it('handles tag with argument', () => {
    const compiled = compile('<link>{name}</link>');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "link",
            [
              "name",
            ],
          ],
        ]
      `);
    const result = format(compiled, 'en', {
      name: 'Click here',
      link: (chunks) => `<a>${chunks.join('')}</a>`
    });
    expect(result).toMatchInlineSnapshot(`"<a>Click here</a>"`);
  });

  it('supports tags returning non-strings', () => {
    const compiled = compile('Hello <bold>{name}</bold>');
    const boldElement = {type: 'bold', children: ['World']};
    const result = format(compiled, 'en', {
      name: 'World',
      bold: () => boldElement
    });
    expect(result).toMatchInlineSnapshot(`
        [
          "Hello ",
          {
            "children": [
              "World",
            ],
            "type": "bold",
          },
        ]
      `);
  });

  it('supports nested tags', () => {
    const compiled = compile('<a><b>text</b></a>');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "a",
            [
              "b",
              "text",
            ],
          ],
        ]
      `);
    interface TagElement {
      tag: string;
      children: Array<string | TagElement>;
    }
    const result = format<TagElement>(compiled, 'en', {
      b: (chunks) => ({tag: 'b', children: chunks}),
      a: (chunks) => ({tag: 'a', children: chunks})
    });
    expect(result).toMatchInlineSnapshot(`
        [
          {
            "children": [
              {
                "children": [
                  "text",
                ],
                "tag": "b",
              },
            ],
            "tag": "a",
          },
        ]
      `);
  });

  it('throws for missing tag handler', () => {
    const compiled = compile('<bold>text</bold>');
    expect(() => format(compiled, 'en', {})).toThrow(
      'Missing value for argument "bold"'
    );
  });

  it('throws for non-function tag handler', () => {
    const compiled = compile('<bold>text</bold>');
    expect(() => format(compiled, 'en', {bold: 'not a function'})).toThrow(
      'Expected function for tag handler "bold"'
    );
  });
});

describe('nesting', () => {
  it('formats select inside plural', () => {
    const compiled = compile(
      '{count, plural, one {{gender, select, female {her item} other {their item}}} other {{gender, select, female {her items} other {their items}}}}'
    );
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "count",
            2,
            {
              "one": [
                [
                  "gender",
                  1,
                  {
                    "female": "her item",
                    "other": "their item",
                  },
                ],
              ],
              "other": [
                [
                  "gender",
                  1,
                  {
                    "female": "her items",
                    "other": "their items",
                  },
                ],
              ],
            },
          ],
        ]
      `);
    expect(
      format(compiled, 'en', {count: 1, gender: 'female'})
    ).toMatchInlineSnapshot(`"her item"`);
    expect(
      format(compiled, 'en', {count: 5, gender: 'female'})
    ).toMatchInlineSnapshot(`"her items"`);
  });

  it('formats plural inside select', () => {
    const compiled = compile(
      '{gender, select, female {{n, plural, one {She has # cat} other {She has # cats}}} other {{n, plural, one {They have # cat} other {They have # cats}}}}'
    );
    expect(
      format(compiled, 'en', {gender: 'female', n: 1})
    ).toMatchInlineSnapshot(`"She has 1 cat"`);
    expect(
      format(compiled, 'en', {gender: 'female', n: 3})
    ).toMatchInlineSnapshot(`"She has 3 cats"`);
    expect(
      format(compiled, 'en', {gender: 'other', n: 1})
    ).toMatchInlineSnapshot(`"They have 1 cat"`);
  });

  it('formats deeply nested structures', () => {
    const compiled = compile(
      '{a, select, x {{b, plural, one {{c, select, y {deep} other {nested}}} other {level}}} other {top}}'
    );
    expect(
      format(compiled, 'en', {a: 'x', b: 1, c: 'y'})
    ).toMatchInlineSnapshot(`"deep"`);
    expect(
      format(compiled, 'en', {a: 'x', b: 1, c: 'z'})
    ).toMatchInlineSnapshot(`"nested"`);
    expect(
      format(compiled, 'en', {a: 'x', b: 2, c: 'y'})
    ).toMatchInlineSnapshot(`"level"`);
    expect(
      format(compiled, 'en', {a: 'z', b: 1, c: 'y'})
    ).toMatchInlineSnapshot(`"top"`);
  });
});

describe('locales', () => {
  it('uses Polish plural rules', () => {
    // Polish: 1 = one, 2-4 = few, 5-21 = many, 22-24 = few, etc.
    const compiled = compile(
      '{n, plural, one {# plik} few {# pliki} many {# plików} other {# pliku}}'
    );
    expect(format(compiled, 'pl', {n: 1})).toMatchInlineSnapshot(`"1 plik"`);
    expect(format(compiled, 'pl', {n: 2})).toMatchInlineSnapshot(`"2 pliki"`);
    expect(format(compiled, 'pl', {n: 5})).toMatchInlineSnapshot(`"5 plików"`);
    expect(format(compiled, 'pl', {n: 22})).toMatchInlineSnapshot(`"22 pliki"`);
  });

  it('uses Russian plural rules', () => {
    // Russian: 1 = one, 2-4 = few, 5-20 = many, 21 = one, 22-24 = few
    const compiled = compile(
      '{n, plural, one {# файл} few {# файла} many {# файлов} other {# файла}}'
    );
    expect(format(compiled, 'ru', {n: 1})).toMatchInlineSnapshot(`"1 файл"`);
    expect(format(compiled, 'ru', {n: 2})).toMatchInlineSnapshot(`"2 файла"`);
    expect(format(compiled, 'ru', {n: 5})).toMatchInlineSnapshot(`"5 файлов"`);
    expect(format(compiled, 'ru', {n: 21})).toMatchInlineSnapshot(`"21 файл"`);
  });

  it('formats numbers with German locale', () => {
    const compiled = compile('{val, number}');
    expect(format(compiled, 'de', {val: 1234.5})).toMatchInlineSnapshot(
      `"1.234,5"`
    );
  });
});

describe('invalid syntax', () => {
  it('throws for unclosed brace', () => {
    expect(() => compile('{name')).toThrow('EXPECT_ARGUMENT_CLOSING_BRACE');
  });

  it('throws for missing argument name', () => {
    expect(() => compile('{}')).toThrow('EMPTY_ARGUMENT');
  });

  it('throws for unclosed tag', () => {
    expect(() => compile('<bold>text')).toThrow('UNCLOSED_TAG');
  });
});

describe('real-world examples', () => {
  it('handles shopping cart', () => {
    const compiled = compile(
      '{itemCount, plural, =0 {Your cart is empty} one {You have # item in your cart} other {You have # items in your cart}}'
    );
    expect(format(compiled, 'en', {itemCount: 0})).toMatchInlineSnapshot(
      `"Your cart is empty"`
    );
    expect(format(compiled, 'en', {itemCount: 1})).toMatchInlineSnapshot(
      `"You have 1 item in your cart"`
    );
    expect(format(compiled, 'en', {itemCount: 5})).toMatchInlineSnapshot(
      `"You have 5 items in your cart"`
    );
  });

  it('handles greeting with gender', () => {
    const compiled = compile(
      '{gender, select, female {Dear Ms. {lastName}} male {Dear Mr. {lastName}} other {Dear {firstName} {lastName}}}'
    );
    expect(
      format(compiled, 'en', {
        gender: 'female',
        firstName: 'Jane',
        lastName: 'Doe'
      })
    ).toMatchInlineSnapshot(`"Dear Ms. Doe"`);
    expect(
      format(compiled, 'en', {
        gender: 'other',
        firstName: 'Alex',
        lastName: 'Smith'
      })
    ).toMatchInlineSnapshot(`"Dear Alex Smith"`);
  });

  it('handles rich text with formatting', () => {
    const compiled = compile(
      'Welcome, <bold>{name}</bold>! You have <link>{count, plural, one {# message} other {# messages}}</link>.'
    );
    const result = format(compiled, 'en', {
      name: 'Alice',
      count: 5,
      bold: (chunks: Array<unknown>) => `<strong>${chunks.join('')}</strong>`,
      link: (chunks: Array<unknown>) =>
        `<a href="/messages">${chunks.join('')}</a>`
    });
    expect(result).toMatchInlineSnapshot(
      `"Welcome, <strong>Alice</strong>! You have <a href="/messages">5 messages</a>."`
    );
  });
});
