import {describe, expect, it} from 'vitest';
import compile from '../src/compiler.js';
import format, {type FormatOptions, type FormatValues} from '../src/format.js';
import type {CompiledMessage} from '../src/types.js';

const formatters: FormatOptions['formatters'] = {
  getDateTimeFormat: (...args) => new Intl.DateTimeFormat(...args),
  getNumberFormat: (...args) => new Intl.NumberFormat(...args),
  getPluralRules: (...args) => new Intl.PluralRules(...args)
};

function formatMessage<T = string>(
  message: CompiledMessage,
  locale: string,
  values: FormatValues<T>,
  options?: Omit<FormatOptions, 'formatters'>
) {
  return format<T>(message, locale, values, {...options, formatters});
}

describe('static text', () => {
  it('handles an empty string', () => {
    const compiled = compile('');
    expect(compiled).toMatchInlineSnapshot(`""`);
    expect(formatMessage(compiled, 'en', {})).toMatchInlineSnapshot(
      `""`
    );
  });

  it('handles plain text', () => {
    const compiled = compile('Hello world');
    expect(compiled).toMatchInlineSnapshot(`"Hello world"`);
    expect(formatMessage(compiled, 'en', {})).toMatchInlineSnapshot(
      `"Hello world"`
    );
  });

  it('handles whitespace', () => {
    const compiled = compile('  Hello  world  ');
    expect(compiled).toMatchInlineSnapshot(`"  Hello  world  "`);
    expect(formatMessage(compiled, 'en', {})).toMatchInlineSnapshot(
      `"  Hello  world  "`
    );
  });

  it('handles unicode content', () => {
    const compiled = compile('こんにちは 🌍');
    expect(compiled).toMatchInlineSnapshot(`"こんにちは 🌍"`);
    expect(formatMessage(compiled, 'en', {})).toMatchInlineSnapshot(
      `"こんにちは 🌍"`
    );
  });
});

describe('escaping', () => {
  it('escapes a single brace', () => {
    const compiled = compile("'{'");
    expect(compiled).toMatchInlineSnapshot(`"{"`);
    expect(formatMessage(compiled, 'en', {})).toMatchInlineSnapshot(
      `"{"`
    );
  });

  it('escapes a closing brace', () => {
    const compiled = compile("'}'");
    expect(compiled).toMatchInlineSnapshot(`"}"`);
    expect(formatMessage(compiled, 'en', {})).toMatchInlineSnapshot(
      `"}"`
    );
  });

  it('escapes braces around text', () => {
    const compiled = compile("'{name}'");
    expect(compiled).toMatchInlineSnapshot(`"{name}"`);
    expect(formatMessage(compiled, 'en', {})).toMatchInlineSnapshot(
      `"{name}"`
    );
  });

  it('escapes single quotes', () => {
    const compiled = compile("It''s working");
    expect(compiled).toMatchInlineSnapshot(`"It's working"`);
    expect(formatMessage(compiled, 'en', {})).toMatchInlineSnapshot(
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
      formatMessage(compiled, 'en', {name: 'test'})
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
      formatMessage(compiled, 'en', {name: 'World'})
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
      formatMessage(compiled, 'en', {name: 'World'})
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
      formatMessage(compiled, 'en', {first: 'John', last: 'Doe'})
    ).toMatchInlineSnapshot(`"John Doe"`);
  });

  it('converts numbers to strings for simple arguments', () => {
    const compiled = compile('{val}');
    expect(
      formatMessage(compiled, 'en', {val: 1234})
    ).toMatchInlineSnapshot(`"1234"`);
    expect(
      formatMessage(compiled, 'en', {val: 0.75})
    ).toMatchInlineSnapshot(`"0.75"`);
  });

  it('throws for a missing argument', () => {
    const compiled = compile('Hello {name}');
    expect(() => formatMessage(compiled, 'en', {})).toThrow(
      'Missing value for argument "name"'
    );
  });

  it('throws for boolean values in plain parameters', () => {
    const compiled = compile('{param}');
    expect(() => formatMessage(compiled, 'en', {param: true})).toThrow(
      'Invalid value for argument "param": Boolean values are not supported and should be converted to strings if needed.'
    );
  });

  it('throws for Date values in plain parameters', () => {
    const compiled = compile('{param}');
    const date = new Date('2024-03-15T14:30:00Z');
    expect(() => formatMessage(compiled, 'en', {param: date})).toThrow(
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
      formatMessage(compiled, 'en', {val: 1234.5})
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
      formatMessage(
        compiled,
        'en',
        {val: 0.75},
        {
          formats: {number: {percent: {style: 'percent'}}}
        }
      )
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
      formatMessage(
        compiled,
        'en',
        {val: 3.7},
        {
          formats: {number: {integer: {maximumFractionDigits: 0}}}
        }
      )
    ).toMatchInlineSnapshot(`"4"`);
  });

  it('formats numbers with a German locale', () => {
    const compiled = compile('{val, number}');
    expect(
      formatMessage(compiled, 'de', {val: 1234.5})
    ).toMatchInlineSnapshot(`"1.234,5"`);
  });

  it('formats currency using skeleton syntax', () => {
    const compiled = compile('{price, number, ::currency/EUR}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "price",
            4,
            {
              "currency": "EUR",
              "style": "currency",
            },
          ],
        ]
      `);
    expect(
      formatMessage(compiled, 'en', {price: 123.45})
    ).toMatchInlineSnapshot(`"€123.45"`);
  });

  it('formats unit using skeleton syntax', () => {
    const compiled = compile('{weight, number, ::unit/kilogram}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "weight",
            4,
            {
              "style": "unit",
              "unit": "kilogram",
            },
          ],
        ]
      `);
    expect(
      formatMessage(compiled, 'en', {weight: 5})
    ).toMatchInlineSnapshot(`"5 kg"`);
  });

  it('formats with decimal precision skeleton', () => {
    const compiled = compile('{val, number, ::.00}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "val",
            4,
            {
              "maximumFractionDigits": 2,
              "minimumFractionDigits": 2,
            },
          ],
        ]
      `);
    expect(
      formatMessage(compiled, 'en', {val: 3.1})
    ).toMatchInlineSnapshot(`"3.10"`);
  });

  it('throws for non-number values', () => {
    const compiled = compile('{val, number}');
    expect(() => formatMessage(compiled, 'en', {val: 'hello'})).toThrow(
      'Expected number for argument "val", got string'
    );
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
    const result = formatMessage(
      compiled,
      'en',
      {d: date},
      {
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
    const result = formatMessage(
      compiled,
      'en',
      {d: date},
      {
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
      const result = formatMessage(
        compiled,
        'en',
        {d: lateDate},
        {
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
      const result = formatMessage(
        compiled,
        'en',
        {d: lateDate},
        {
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

  it('formats date using skeleton syntax', () => {
    const compiled = compile('{d, date, ::yyyy-MM-dd}');
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "d",
            5,
            {
              "day": "2-digit",
              "month": "2-digit",
              "year": "numeric",
            },
          ],
        ]
      `);
    expect(
      formatMessage(compiled, 'en', {d: date}, {timeZone: 'UTC'})
    ).toMatchInlineSnapshot(`"03/15/2024"`);
  });

  it('throws for non-Date values', () => {
    const compiled = compile('{d, date}');
    expect(() =>
      formatMessage(compiled, 'en', {d: 'not a date'})
    ).toThrow('Expected Date for argument "d", got string');
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
    const result = formatMessage(
      compiled,
      'en',
      {t: date},
      {
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
      const result = formatMessage(
        compiled,
        'en',
        {t: date},
        {
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
      const result = formatMessage(
        compiled,
        'en',
        {t: date},
        {
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

  it('throws for non-Date values', () => {
    const compiled = compile('{t, time}');
    expect(() =>
      formatMessage(compiled, 'en', {t: 'not a date'})
    ).toThrow('Expected Date for argument "t", got string');
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
      formatMessage(compiled, 'en', {gender: 'female'})
    ).toMatchInlineSnapshot(`"She"`);
    expect(
      formatMessage(compiled, 'en', {gender: 'male'})
    ).toMatchInlineSnapshot(`"He"`);
  });

  it('falls back to other', () => {
    const compiled = compile(
      '{gender, select, female {She} male {He} other {They}}'
    );
    expect(
      formatMessage(compiled, 'en', {gender: 'unknown'})
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
      formatMessage(compiled, 'en', {gender: 'female', name: 'Alice'})
    ).toMatchInlineSnapshot(`"Alice is a woman"`);
  });

  it('formats multiple arguments in branches', () => {
    const compiled = compile(
      '{gender, select, female {Dear Ms. {lastName}} male {Dear Mr. {lastName}} other {Dear {firstName} {lastName}}}'
    );
    expect(
      formatMessage(
        compiled,
        'en',
        {
          gender: 'female',
          firstName: 'Jane',
          lastName: 'Doe'
        }
      )
    ).toMatchInlineSnapshot(`"Dear Ms. Doe"`);
    expect(
      formatMessage(
        compiled,
        'en',
        {
          gender: 'other',
          firstName: 'Alex',
          lastName: 'Smith'
        }
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

    const result = formatMessage(
      compiled,
      'en',
      {
        gender: 'male',
        b: () => ({tag: 'b'})
      }
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
      formatMessage(
        compiled,
        'en',
        {gender: 'male', value: 1234},
        {formats: {number: {}}}
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
      formatMessage(compiled, 'en', {count: 1})
    ).toMatchInlineSnapshot(`"1 item"`);
    expect(
      formatMessage(compiled, 'en', {count: 5})
    ).toMatchInlineSnapshot(`"5 items"`);
    expect(
      formatMessage(compiled, 'en', {count: 0})
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
      formatMessage(compiled, 'en', {count: 0})
    ).toMatchInlineSnapshot(`"no items"`);
    expect(
      formatMessage(compiled, 'en', {count: 1})
    ).toMatchInlineSnapshot(`"one item"`);
    expect(
      formatMessage(compiled, 'en', {count: 2})
    ).toMatchInlineSnapshot(`"2 items"`);
  });

  it('formats the pound sign with the locale', () => {
    const compiled = compile('{count, plural, one {# item} other {# items}}');
    expect(
      formatMessage(compiled, 'de', {count: 1000})
    ).toMatchInlineSnapshot(`"1.000 items"`);
  });

  it('uses Polish plural rules', () => {
    // Polish: 1 = one, 2-4 = few, 5-21 = many, 22-24 = few, etc.
    const compiled = compile(
      '{n, plural, one {# plik} few {# pliki} many {# plików} other {# pliku}}'
    );
    expect(formatMessage(compiled, 'pl', {n: 1})).toMatchInlineSnapshot(
      `"1 plik"`
    );
    expect(formatMessage(compiled, 'pl', {n: 2})).toMatchInlineSnapshot(
      `"2 pliki"`
    );
    expect(formatMessage(compiled, 'pl', {n: 5})).toMatchInlineSnapshot(
      `"5 plików"`
    );
    expect(formatMessage(compiled, 'pl', {n: 22})).toMatchInlineSnapshot(
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
    expect(formatMessage(compiled, 'en', {n: 1})).toMatchInlineSnapshot(
      `"1st"`
    );
    expect(formatMessage(compiled, 'en', {n: 2})).toMatchInlineSnapshot(
      `"2nd"`
    );
    expect(formatMessage(compiled, 'en', {n: 3})).toMatchInlineSnapshot(
      `"3rd"`
    );
    expect(formatMessage(compiled, 'en', {n: 4})).toMatchInlineSnapshot(
      `"4th"`
    );
    expect(formatMessage(compiled, 'en', {n: 11})).toMatchInlineSnapshot(
      `"11th"`
    );
    expect(formatMessage(compiled, 'en', {n: 21})).toMatchInlineSnapshot(
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
    const result = formatMessage(
      compiled,
      'en',
      {
        bold: (chunks) => `<b>${chunks.join('')}</b>`
      }
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
    const result = formatMessage(
      compiled,
      'en',
      {
        br: () => '<br/>'
      }
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
    const result = formatMessage(
      compiled,
      'en',
      {
        name: 'Click here',
        link: (chunks) => `<a>${chunks.join('')}</a>`
      }
    );
    expect(result).toMatchInlineSnapshot(`"<a>Click here</a>"`);
  });

  it('handles a tag with a pound sign', () => {
    const compiled = compile(
      '{count, plural, one {<bold>#</bold>} other {<bold>#</bold>}}'
    );
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "count",
            2,
            {
              "one": [
                [
                  "bold",
                  0,
                ],
              ],
              "other": [
                [
                  "bold",
                  0,
                ],
              ],
            },
          ],
        ]
      `);
    const result = formatMessage(
      compiled,
      'en',
      {
        bold: (chunks) => `<b>${chunks.join('')}</b>`,
        count: 2
      }
    );
    expect(result).toMatchInlineSnapshot(`"<b>2</b>"`);
  });

  it('supports tags returning non-strings', () => {
    const compiled = compile('Hello <bold>{name}</bold>');
    const boldElement = {type: 'bold', children: ['World']};
    const result = formatMessage(
      compiled,
      'en',
      {
        name: 'World',
        bold: () => boldElement
      }
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
    expect(() => formatMessage(compiled, 'en', {})).toThrow(
      'Missing value for argument "bold"'
    );
  });

  it('throws for a non-function tag handler', () => {
    const compiled = compile('<bold>text</bold>');
    expect(() =>
      formatMessage(compiled, 'en', {bold: 'not a function'})
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

      const result = formatMessage<ReactElement>(
        compiled,
        'en',
        {
          b: (chunks) => ({type: 'b', props: {children: chunks}}),
          a: (chunks) => ({type: 'a', props: {children: chunks}})
        }
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

describe('errors', () => {
  it('throws for an unclosed brace', () => {
    expect(() => compile('{name')).toThrow('EXPECT_ARGUMENT_CLOSING_BRACE');
  });

  it('throws for a missing argument name', () => {
    expect(() => compile('{}')).toThrow('EMPTY_ARGUMENT');
  });

  it('throws for an unclosed tag', () => {
    expect(() => compile('<bold>text')).toThrow('UNCLOSED_TAG');
  });

  it('throws for unknown compiled node type', () => {
    // Manually construct an invalid compiled message with unknown type 99
    const invalidCompiled = [['name', 99]] as unknown as ReturnType<
      typeof compile
    >;
    expect(() => formatMessage(invalidCompiled, 'en', {name: 'test'})).toThrow(
      'Unknown compiled node type: 99'
    );
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
      formatMessage(compiled, 'en', {count: 1, gender: 'female'})
    ).toMatchInlineSnapshot(`"her item"`);
    expect(
      formatMessage(compiled, 'en', {count: 5, gender: 'female'})
    ).toMatchInlineSnapshot(`"her items"`);
  });

  it('formats a plural inside a select', () => {
    const compiled = compile(
      '{gender, select, female {{n, plural, one {She has # cat} other {She has # cats}}} other {{n, plural, one {They have # cat} other {They have # cats}}}}'
    );
    expect(
      formatMessage(compiled, 'en', {gender: 'female', n: 1})
    ).toMatchInlineSnapshot(`"She has 1 cat"`);
    expect(
      formatMessage(compiled, 'en', {gender: 'female', n: 3})
    ).toMatchInlineSnapshot(`"She has 3 cats"`);
    expect(
      formatMessage(compiled, 'en', {gender: 'other', n: 1})
    ).toMatchInlineSnapshot(`"They have 1 cat"`);
  });

  it('formats deeply nested structures', () => {
    const compiled = compile(
      '{a, select, x {{b, plural, one {{c, select, y {deep} other {nested}}} other {level}}} other {top}}'
    );
    expect(
      formatMessage(compiled, 'en', {a: 'x', b: 1, c: 'y'})
    ).toMatchInlineSnapshot(`"deep"`);
    expect(
      formatMessage(compiled, 'en', {a: 'x', b: 1, c: 'z'})
    ).toMatchInlineSnapshot(`"nested"`);
    expect(
      formatMessage(compiled, 'en', {a: 'x', b: 2, c: 'y'})
    ).toMatchInlineSnapshot(`"level"`);
    expect(
      formatMessage(compiled, 'en', {a: 'z', b: 1, c: 'y'})
    ).toMatchInlineSnapshot(`"top"`);
  });

  it('formats tags with plural and arguments', () => {
    const compiled = compile(
      'Welcome, <bold>{name}</bold>! You have <link>{count, plural, one {# message} other {# messages}}</link>.'
    );
    const result = formatMessage(
      compiled,
      'en',
      {
        name: 'Alice',
        count: 5,
        bold: (chunks: Array<unknown>) => `<strong>${chunks.join('')}</strong>`,
        link: (chunks: Array<unknown>) =>
          `<a href="/messages">${chunks.join('')}</a>`
      }
    );
    expect(result).toMatchInlineSnapshot(
      `"Welcome, <strong>Alice</strong>! You have <a href="/messages">5 messages</a>."`
    );
  });
});
