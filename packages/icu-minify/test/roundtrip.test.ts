import {describe, expect, it} from 'vitest';
import compile from '../src/compiler.js';
import format from '../src/format.js';

type Formatters = {
  getDateTimeFormat(
    ...args: ConstructorParameters<typeof Intl.DateTimeFormat>
  ): Intl.DateTimeFormat;
  getNumberFormat(
    ...args: ConstructorParameters<typeof Intl.NumberFormat>
  ): Intl.NumberFormat;
  getPluralRules(
    ...args: ConstructorParameters<typeof Intl.PluralRules>
  ): Intl.PluralRules;
};

function createFormatters(): Formatters {
  // Will typically use caching in a real implementation
  return {
    getDateTimeFormat(...args) {
      return new Intl.DateTimeFormat(...args);
    },
    getNumberFormat(...args) {
      return new Intl.NumberFormat(...args);
    },
    getPluralRules(...args) {
      return new Intl.PluralRules(...args);
    }
  };
}

const formatters = createFormatters();

describe('static text', () => {
  it('handles an empty string', () => {
    const compiled = compile('');
    expect(compiled).toMatchInlineSnapshot(`""`);
    expect(format(compiled, 'en', {}, {formatters})).toMatchInlineSnapshot(
      `""`
    );
  });

  it('handles plain text', () => {
    const compiled = compile('Hello world');
    expect(compiled).toMatchInlineSnapshot(`"Hello world"`);
    expect(format(compiled, 'en', {}, {formatters})).toMatchInlineSnapshot(
      `"Hello world"`
    );
  });

  it('handles whitespace', () => {
    const compiled = compile('  Hello  world  ');
    expect(compiled).toMatchInlineSnapshot(`"  Hello  world  "`);
    expect(format(compiled, 'en', {}, {formatters})).toMatchInlineSnapshot(
      `"  Hello  world  "`
    );
  });

  it('handles unicode content', () => {
    const compiled = compile('こんにちは 🌍');
    expect(compiled).toMatchInlineSnapshot(`"こんにちは 🌍"`);
    expect(format(compiled, 'en', {}, {formatters})).toMatchInlineSnapshot(
      `"こんにちは 🌍"`
    );
  });
});

describe('escaping', () => {
  it('escapes a single brace', () => {
    const compiled = compile("'{'");
    expect(compiled).toMatchInlineSnapshot(`"{"`);
    expect(format(compiled, 'en', {}, {formatters})).toMatchInlineSnapshot(
      `"{"`
    );
  });

  it('escapes a closing brace', () => {
    const compiled = compile("'}'");
    expect(compiled).toMatchInlineSnapshot(`"}"`);
    expect(format(compiled, 'en', {}, {formatters})).toMatchInlineSnapshot(
      `"}"`
    );
  });

  it('escapes braces around text', () => {
    const compiled = compile("'{name}'");
    expect(compiled).toMatchInlineSnapshot(`"{name}"`);
    expect(format(compiled, 'en', {}, {formatters})).toMatchInlineSnapshot(
      `"{name}"`
    );
  });

  it('escapes single quotes', () => {
    const compiled = compile("It''s working");
    expect(compiled).toMatchInlineSnapshot(`"It's working"`);
    expect(format(compiled, 'en', {}, {formatters})).toMatchInlineSnapshot(
      `"It's working"`
    );
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
    expect(
      format(compiled, 'en', {name: 'test'}, {formatters})
    ).toMatchInlineSnapshot(`"{name} is test"`);
  });
});

describe('simple arguments', () => {
  it('formats a single argument', () => {
    const compiled = compile('{name}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "name",
          ],
        ]
      `);
    expect(
      format(compiled, 'en', {name: 'World'}, {formatters})
    ).toMatchInlineSnapshot(`"World"`);
  });

  it('formats text with an argument', () => {
    const compiled = compile('Hello {name}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          "Hello ",
          [
            "name",
          ],
        ]
      `);
    expect(
      format(compiled, 'en', {name: 'World'}, {formatters})
    ).toMatchInlineSnapshot(`"Hello World"`);
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
      format(compiled, 'en', {first: 'John', last: 'Doe'}, {formatters})
    ).toMatchInlineSnapshot(`"John Doe"`);
  });

  it('converts numbers to strings for simple arguments', () => {
    const compiled = compile('{val}');
    expect(
      format(compiled, 'en', {val: 1234}, {formatters})
    ).toMatchInlineSnapshot(`"1234"`);
    expect(
      format(compiled, 'en', {val: 0.75}, {formatters})
    ).toMatchInlineSnapshot(`"0.75"`);
  });

  it('throws for a missing argument', () => {
    const compiled = compile('Hello {name}');
    expect(() => format(compiled, 'en', {}, {formatters})).toThrow(
      'Missing value for argument "name"'
    );
  });

  it('throws for boolean values in plain parameters', () => {
    const compiled = compile('{param}');
    expect(() => format(compiled, 'en', {param: true}, {formatters})).toThrow(
      'Invalid value for argument "param": Boolean values are not supported and should be converted to strings if needed.'
    );
  });

  it('throws for Date values in plain parameters', () => {
    const compiled = compile('{param}');
    const date = new Date('2024-03-15T14:30:00Z');
    expect(() => format(compiled, 'en', {param: date}, {formatters})).toThrow(
      'Invalid value for argument "param": Date values are not supported for plain parameters. Use date formatting instead (e.g. {param, date}).'
    );
  });
});

describe('number formatting', () => {
  it('formats a plain number', () => {
    const compiled = compile('{val, number}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "val",
            4,
          ],
        ]
      `);
    expect(
      format(compiled, 'en', {val: 1234.5}, {formatters})
    ).toMatchInlineSnapshot(`"1,234.5"`);
  });

  it('formats a percentage', () => {
    const compiled = compile('{val, number, percent}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "val",
            4,
            "percent",
          ],
        ]
      `);
    expect(
      format(compiled, 'en', {val: 0.75}, {formatters})
    ).toMatchInlineSnapshot(`"75%"`);
  });

  it('formats an integer', () => {
    const compiled = compile('{val, number, integer}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "val",
            4,
            "integer",
          ],
        ]
      `);
    expect(
      format(compiled, 'en', {val: 3.7}, {formatters})
    ).toMatchInlineSnapshot(`"4"`);
  });

  it('formats numbers with a German locale', () => {
    const compiled = compile('{val, number}');
    expect(
      format(compiled, 'de', {val: 1234.5}, {formatters})
    ).toMatchInlineSnapshot(`"1.234,5"`);
  });
});

describe('date formatting', () => {
  const date = new Date('2024-03-15T14:30:00Z');

  it('formats a date with short style', () => {
    const compiled = compile('{d, date, short}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "d",
            5,
            "short",
          ],
        ]
      `);
    const result = format(
      compiled,
      'en',
      {d: date},
      {
        formatters,
        formats: {
          date: {
            short: {month: 'numeric', day: 'numeric', year: '2-digit'}
          }
        }
      }
    );
    expect(result).toContain('3');
    expect(result).toContain('15');
  });

  it('formats a date with medium style', () => {
    const compiled = compile('{d, date, medium}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "d",
            5,
            "medium",
          ],
        ]
      `);
    const result = format(
      compiled,
      'en',
      {d: date},
      {
        formatters,
        formats: {
          date: {
            medium: {month: 'short', day: 'numeric', year: 'numeric'}
          }
        }
      }
    );
    expect(result).toContain('Mar');
  });

  describe('timeZone', () => {
    // 20:00 UTC = 05:00 next day in Tokyo
    const lateDate = new Date('2024-03-15T20:00:00Z');

    it('uses global timeZone', () => {
      const compiled = compile('{d, date, custom}');
      const result = format(
        compiled,
        'en',
        {d: lateDate},
        {
          formatters,
          timeZone: 'Asia/Tokyo',
          formats: {
            date: {custom: {year: 'numeric', month: 'short', day: 'numeric'}}
          }
        }
      );
      expect(result).toMatchInlineSnapshot(`"Mar 16, 2024"`);
    });

    it('prefers format-specific timeZone over global', () => {
      const compiled = compile('{d, date, utc}');
      const result = format(
        compiled,
        'en',
        {d: lateDate},
        {
          formatters,
          timeZone: 'Asia/Tokyo',
          formats: {
            date: {
              utc: {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
              }
            }
          }
        }
      );
      expect(result).toMatchInlineSnapshot(`"Mar 15, 2024"`);
    });
  });
});

describe('time formatting', () => {
  const date = new Date('2024-03-15T14:30:00Z');

  it('formats a time with short style', () => {
    const compiled = compile('{t, time, short}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "t",
            6,
            "short",
          ],
        ]
      `);
    const result = format(
      compiled,
      'en',
      {t: date},
      {
        formatters,
        formats: {
          time: {
            short: {hour: 'numeric', minute: 'numeric'}
          }
        }
      }
    );
    expect(typeof result).toBe('string');
  });

  describe('timeZone', () => {
    it('uses global timeZone', () => {
      const compiled = compile('{t, time, custom}');
      const result = format(
        compiled,
        'en',
        {t: date},
        {
          formatters,
          timeZone: 'America/New_York',
          formats: {
            time: {custom: {hour: 'numeric', minute: 'numeric', hour12: false}}
          }
        }
      );
      expect(result).toMatchInlineSnapshot(`"10:30"`);
    });

    it('prefers format-specific timeZone over global', () => {
      const compiled = compile('{t, time, utc}');
      const result = format(
        compiled,
        'en',
        {t: date},
        {
          formatters,
          timeZone: 'America/New_York',
          formats: {
            time: {
              utc: {
                hour: 'numeric',
                minute: 'numeric',
                hour12: false,
                timeZone: 'UTC'
              }
            }
          }
        }
      );
      expect(result).toMatchInlineSnapshot(`"14:30"`);
    });
  });
});

describe('select', () => {
  it('selects the matching branch', () => {
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
    expect(
      format(compiled, 'en', {gender: 'female'}, {formatters})
    ).toMatchInlineSnapshot(`"She"`);
    expect(
      format(compiled, 'en', {gender: 'male'}, {formatters})
    ).toMatchInlineSnapshot(`"He"`);
  });

  it('falls back to other', () => {
    const compiled = compile(
      '{gender, select, female {She} male {He} other {They}}'
    );
    expect(
      format(compiled, 'en', {gender: 'unknown'}, {formatters})
    ).toMatchInlineSnapshot(`"They"`);
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
      format(compiled, 'en', {gender: 'female', name: 'Alice'}, {formatters})
    ).toMatchInlineSnapshot(`"Alice is a woman"`);
  });

  it('formats multiple arguments in branches', () => {
    const compiled = compile(
      '{gender, select, female {Dear Ms. {lastName}} male {Dear Mr. {lastName}} other {Dear {firstName} {lastName}}}'
    );
    expect(
      format(
        compiled,
        'en',
        {
          gender: 'female',
          firstName: 'Jane',
          lastName: 'Doe'
        },
        {formatters}
      )
    ).toMatchInlineSnapshot(`"Dear Ms. Doe"`);
    expect(
      format(
        compiled,
        'en',
        {
          gender: 'other',
          firstName: 'Alex',
          lastName: 'Smith'
        },
        {formatters}
      )
    ).toMatchInlineSnapshot(`"Dear Alex Smith"`);
  });

  it('throws for a select without other', () => {
    expect(() => compile('{gender, select, female {She} male {He}}')).toThrow(
      'MISSING_OTHER_CLAUSE'
    );
  });

  it('does not unwrap single tag nodes in branches', () => {
    // If a branch was unwrapped to a single array node (e.g. ["b","Hi"]),
    // the runtime would treat it as a list of nodes and never execute the tag.
    const compiled = compile(
      '{gender, select, male {<b>Hi</b>} other {<b>Bye</b>}}'
    );
    expect(compiled).toMatchInlineSnapshot(`
      [
        [
          "gender",
          1,
          {
            "male": [
              [
                "b",
                "Hi",
              ],
            ],
            "other": [
              [
                "b",
                "Bye",
              ],
            ],
          },
        ],
      ]
    `);

    const result = format(
      compiled,
      'en',
      {
        gender: 'male',
        b: () => ({tag: 'b'})
      },
      {formatters}
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "tag": "b",
      }
    `);
  });

  it('does not unwrap single typed nodes in branches', () => {
    // Same issue as above, but for typed nodes like ["value", 4].
    const compiled = compile(
      '{gender, select, male {{value, number}} other {fallback}}'
    );
    expect(compiled).toMatchInlineSnapshot(`
      [
        [
          "gender",
          1,
          {
            "male": [
              [
                "value",
                4,
              ],
            ],
            "other": "fallback",
          },
        ],
      ]
    `);

    expect(
      format(
        compiled,
        'en',
        {gender: 'male', value: 1234},
        {formats: {number: {}}, formatters}
      )
    ).toBe('1,234');
  });
});

describe('cardinal plural (plural)', () => {
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
    expect(
      format(compiled, 'en', {count: 1}, {formatters})
    ).toMatchInlineSnapshot(`"1 item"`);
    expect(
      format(compiled, 'en', {count: 5}, {formatters})
    ).toMatchInlineSnapshot(`"5 items"`);
    expect(
      format(compiled, 'en', {count: 0}, {formatters})
    ).toMatchInlineSnapshot(`"0 items"`);
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
    expect(
      format(compiled, 'en', {count: 0}, {formatters})
    ).toMatchInlineSnapshot(`"no items"`);
    expect(
      format(compiled, 'en', {count: 1}, {formatters})
    ).toMatchInlineSnapshot(`"one item"`);
    expect(
      format(compiled, 'en', {count: 2}, {formatters})
    ).toMatchInlineSnapshot(`"2 items"`);
  });

  it('formats the pound sign with the locale', () => {
    const compiled = compile('{count, plural, one {# item} other {# items}}');
    expect(
      format(compiled, 'de', {count: 1000}, {formatters})
    ).toMatchInlineSnapshot(`"1.000 items"`);
  });

  it('uses Polish plural rules', () => {
    // Polish: 1 = one, 2-4 = few, 5-21 = many, 22-24 = few, etc.
    const compiled = compile(
      '{n, plural, one {# plik} few {# pliki} many {# plików} other {# pliku}}'
    );
    expect(format(compiled, 'pl', {n: 1}, {formatters})).toMatchInlineSnapshot(
      `"1 plik"`
    );
    expect(format(compiled, 'pl', {n: 2}, {formatters})).toMatchInlineSnapshot(
      `"2 pliki"`
    );
    expect(format(compiled, 'pl', {n: 5}, {formatters})).toMatchInlineSnapshot(
      `"5 plików"`
    );
    expect(format(compiled, 'pl', {n: 22}, {formatters})).toMatchInlineSnapshot(
      `"22 pliki"`
    );
  });

  it('throws for a plural without other', () => {
    expect(() => compile('{count, plural, one {item}}')).toThrow(
      'MISSING_OTHER_CLAUSE'
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
    expect(format(compiled, 'en', {n: 1}, {formatters})).toMatchInlineSnapshot(
      `"1st"`
    );
    expect(format(compiled, 'en', {n: 2}, {formatters})).toMatchInlineSnapshot(
      `"2nd"`
    );
    expect(format(compiled, 'en', {n: 3}, {formatters})).toMatchInlineSnapshot(
      `"3rd"`
    );
    expect(format(compiled, 'en', {n: 4}, {formatters})).toMatchInlineSnapshot(
      `"4th"`
    );
    expect(format(compiled, 'en', {n: 11}, {formatters})).toMatchInlineSnapshot(
      `"11th"`
    );
    expect(format(compiled, 'en', {n: 21}, {formatters})).toMatchInlineSnapshot(
      `"21st"`
    );
  });
});

describe('tags', () => {
  it('calls a tag handler with children', () => {
    const compiled = compile('<bold>important</bold>');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "bold",
            "important",
          ],
        ]
      `);
    const result = format(
      compiled,
      'en',
      {
        bold: (chunks) => `<b>${chunks.join('')}</b>`
      },
      {formatters}
    );
    expect(result).toMatchInlineSnapshot(`"<b>important</b>"`);
  });

  it('handles an empty tag', () => {
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
    const result = format(
      compiled,
      'en',
      {
        br: () => '<br/>'
      },
      {formatters}
    );
    expect(result).toMatchInlineSnapshot(`"<br/>"`);
  });

  it('handles a tag with an argument', () => {
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
    const result = format(
      compiled,
      'en',
      {
        name: 'Click here',
        link: (chunks) => `<a>${chunks.join('')}</a>`
      },
      {formatters}
    );
    expect(result).toMatchInlineSnapshot(`"<a>Click here</a>"`);
  });

  it('supports tags returning non-strings', () => {
    const compiled = compile('Hello <bold>{name}</bold>');
    const boldElement = {type: 'bold', children: ['World']};
    const result = format(
      compiled,
      'en',
      {
        name: 'World',
        bold: () => boldElement
      },
      {formatters}
    );
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

  it('throws for a missing tag handler', () => {
    const compiled = compile('<bold>text</bold>');
    expect(() => format(compiled, 'en', {}, {formatters})).toThrow(
      'Missing value for argument "bold"'
    );
  });

  it('throws for a non-function tag handler', () => {
    const compiled = compile('<bold>text</bold>');
    expect(() =>
      format(compiled, 'en', {bold: 'not a function'}, {formatters})
    ).toThrow('Expected function for tag handler "bold"');
  });

  describe('React elements', () => {
    type ReactElement = {
      type: string;
      props: {
        children?: Array<string | ReactElement>;
      };
    };

    it('supports a complex case', () => {
      const compiled = compile('Hello <a>foo <b>text</b></a>!');
      expect(compiled).toMatchInlineSnapshot(`
        [
          "Hello ",
          [
            "a",
            "foo ",
            [
              "b",
              "text",
            ],
          ],
          "!",
        ]
      `);

      const result = format<ReactElement>(
        compiled,
        'en',
        {
          b: (chunks) => ({type: 'b', props: {children: chunks}}),
          a: (chunks) => ({type: 'a', props: {children: chunks}})
        },
        {formatters}
      );
      expect(result).toMatchInlineSnapshot(`
        [
          "Hello ",
          {
            "props": {
              "children": [
                "foo ",
                {
                  "props": {
                    "children": [
                      "text",
                    ],
                  },
                  "type": "b",
                },
              ],
            },
            "type": "a",
          },
          "!",
        ]
      `);
    });
  });
});

describe('invalid syntax', () => {
  it('throws for an unclosed brace', () => {
    expect(() => compile('{name')).toThrow('EXPECT_ARGUMENT_CLOSING_BRACE');
  });

  it('throws for a missing argument name', () => {
    expect(() => compile('{}')).toThrow('EMPTY_ARGUMENT');
  });

  it('throws for an unclosed tag', () => {
    expect(() => compile('<bold>text')).toThrow('UNCLOSED_TAG');
  });
});

describe('mixed', () => {
  it('formats a select inside a plural', () => {
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
      format(compiled, 'en', {count: 1, gender: 'female'}, {formatters})
    ).toMatchInlineSnapshot(`"her item"`);
    expect(
      format(compiled, 'en', {count: 5, gender: 'female'}, {formatters})
    ).toMatchInlineSnapshot(`"her items"`);
  });

  it('formats a plural inside a select', () => {
    const compiled = compile(
      '{gender, select, female {{n, plural, one {She has # cat} other {She has # cats}}} other {{n, plural, one {They have # cat} other {They have # cats}}}}'
    );
    expect(
      format(compiled, 'en', {gender: 'female', n: 1}, {formatters})
    ).toMatchInlineSnapshot(`"She has 1 cat"`);
    expect(
      format(compiled, 'en', {gender: 'female', n: 3}, {formatters})
    ).toMatchInlineSnapshot(`"She has 3 cats"`);
    expect(
      format(compiled, 'en', {gender: 'other', n: 1}, {formatters})
    ).toMatchInlineSnapshot(`"They have 1 cat"`);
  });

  it('formats deeply nested structures', () => {
    const compiled = compile(
      '{a, select, x {{b, plural, one {{c, select, y {deep} other {nested}}} other {level}}} other {top}}'
    );
    expect(
      format(compiled, 'en', {a: 'x', b: 1, c: 'y'}, {formatters})
    ).toMatchInlineSnapshot(`"deep"`);
    expect(
      format(compiled, 'en', {a: 'x', b: 1, c: 'z'}, {formatters})
    ).toMatchInlineSnapshot(`"nested"`);
    expect(
      format(compiled, 'en', {a: 'x', b: 2, c: 'y'}, {formatters})
    ).toMatchInlineSnapshot(`"level"`);
    expect(
      format(compiled, 'en', {a: 'z', b: 1, c: 'y'}, {formatters})
    ).toMatchInlineSnapshot(`"top"`);
  });

  it('formats tags with plural and arguments', () => {
    const compiled = compile(
      'Welcome, <bold>{name}</bold>! You have <link>{count, plural, one {# message} other {# messages}}</link>.'
    );
    const result = format(
      compiled,
      'en',
      {
        name: 'Alice',
        count: 5,
        bold: (chunks: Array<unknown>) => `<strong>${chunks.join('')}</strong>`,
        link: (chunks: Array<unknown>) =>
          `<a href="/messages">${chunks.join('')}</a>`
      },
      {formatters}
    );
    expect(result).toMatchInlineSnapshot(
      `"Welcome, <strong>Alice</strong>! You have <a href="/messages">5 messages</a>."`
    );
  });
});
