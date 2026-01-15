import {IntlMessageFormat} from 'intl-messageformat';
import {describe, expect, it} from 'vitest';
import compile from '../src/compiler.js';
import format, {
  type FormatOptions,
  type FormatValues,
  type Formats
} from '../src/format.js';
import type {CompiledMessage} from '../src/types.js';

const formatters: FormatOptions['formatters'] = {
  getDateTimeFormat: (...args) => new Intl.DateTimeFormat(...args),
  getNumberFormat: (...args) => new Intl.NumberFormat(...args),
  getPluralRules: (...args) => new Intl.PluralRules(...args)
};

type FormatResult<RichTextElement> =
  | string
  | RichTextElement
  | Array<string | RichTextElement>;

type IntlMessageFormatFormats = ConstructorParameters<
  typeof IntlMessageFormat
>[2];
type IntlMessageFormatOptions = ConstructorParameters<
  typeof IntlMessageFormat
>[3];

function formatMessage<T = string>(
  message: CompiledMessage,
  locale: string,
  values: FormatValues<T>,
  options?: Omit<FormatOptions, 'formatters'>
) {
  return format<T>(message, locale, values, {...options, formatters});
}

function formatWithIntlMessageFormat<T = string>(
  message: string,
  locale: string,
  values: FormatValues<T>,
  options?: Omit<FormatOptions, 'formatters'>
): FormatResult<T> {
  const normalizedFormats = applyGlobalTimeZone(
    options?.formats,
    options?.timeZone
  );
  const formatterOptions = options?.timeZone
    ? ({timeZone: options.timeZone} as IntlMessageFormatOptions)
    : undefined;
  const formatter = new IntlMessageFormat(
    message,
    locale,
    normalizedFormats as IntlMessageFormatFormats,
    formatterOptions
  );
  return formatter.format(values) as FormatResult<T>;
}

function applyGlobalTimeZone(
  formats: Formats | undefined,
  timeZone: string | undefined
): Formats | undefined {
  if (!timeZone || !formats) {
    return formats;
  }

  function applyTimeZoneMap(
    formatMap: Record<string, Intl.DateTimeFormatOptions> | undefined
  ) {
    if (!formatMap) {
      return undefined;
    }

    const updated: Record<string, Intl.DateTimeFormatOptions> = {};
    for (const [key, value] of Object.entries(formatMap)) {
      updated[key] = value.timeZone ? value : {...value, timeZone};
    }
    return updated;
  }

  const date = applyTimeZoneMap(formats.date);
  const time = applyTimeZoneMap(formats.time);
  const number = formats.number;

  return {
    ...(date ? {date} : {}),
    ...(number ? {number} : {}),
    ...(time ? {time} : {})
  };
}

function expectMatchesIntlMessageFormat<T = string>(
  message: string,
  locale: string,
  values: FormatValues<T>,
  options: Omit<FormatOptions, 'formatters'> | undefined,
  result: FormatResult<T>
) {
  const expected = formatWithIntlMessageFormat(message, locale, values, options);
  expect(result).toEqual(expected);
}

describe('static text', () => {
  it('handles an empty string', () => {
    const message = '';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`""`);
    const result = formatMessage(compiled, 'en', {});
    expect(result).toMatchInlineSnapshot(`""`);
    expectMatchesIntlMessageFormat(message, 'en', {}, undefined, result);
  });

  it('handles plain text', () => {
    const message = 'Hello world';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`"Hello world"`);
    const result = formatMessage(compiled, 'en', {});
    expect(result).toMatchInlineSnapshot(`"Hello world"`);
    expectMatchesIntlMessageFormat(message, 'en', {}, undefined, result);
  });

  it('handles whitespace', () => {
    const message = '  Hello  world  ';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`"  Hello  world  "`);
    const result = formatMessage(compiled, 'en', {});
    expect(result).toMatchInlineSnapshot(`"  Hello  world  "`);
    expectMatchesIntlMessageFormat(message, 'en', {}, undefined, result);
  });

  it('handles unicode content', () => {
    const message = 'こんにちは 🌍';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`"こんにちは 🌍"`);
    const result = formatMessage(compiled, 'en', {});
    expect(result).toMatchInlineSnapshot(`"こんにちは 🌍"`);
    expectMatchesIntlMessageFormat(message, 'en', {}, undefined, result);
  });
});

describe('escaping', () => {
  it('escapes a single brace', () => {
    const message = "'{'";
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`"{"`);
    const result = formatMessage(compiled, 'en', {});
    expect(result).toMatchInlineSnapshot(`"{"`);
    expectMatchesIntlMessageFormat(message, 'en', {}, undefined, result);
  });

  it('escapes a closing brace', () => {
    const message = "'}'";
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`"}"`);
    const result = formatMessage(compiled, 'en', {});
    expect(result).toMatchInlineSnapshot(`"}"`);
    expectMatchesIntlMessageFormat(message, 'en', {}, undefined, result);
  });

  it('escapes braces around text', () => {
    const message = "'{name}'";
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`"{name}"`);
    const result = formatMessage(compiled, 'en', {});
    expect(result).toMatchInlineSnapshot(`"{name}"`);
    expectMatchesIntlMessageFormat(message, 'en', {}, undefined, result);
  });

  it('escapes single quotes', () => {
    const message = "It''s working";
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`"It's working"`);
    const result = formatMessage(compiled, 'en', {});
    expect(result).toMatchInlineSnapshot(`"It's working"`);
    expectMatchesIntlMessageFormat(message, 'en', {}, undefined, result);
  });

  it('handles mixed escaped and unescaped', () => {
    const message = "'{name}' is {name}";
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`
        [
          "{name} is ",
          [
            "name",
          ],
        ]
      `);
    const result = formatMessage(compiled, 'en', {name: 'test'});
    expect(result).toMatchInlineSnapshot(`"{name} is test"`);
    expectMatchesIntlMessageFormat(message, 'en', {name: 'test'}, undefined, result);
  });
});

describe('simple arguments', () => {
  it('formats a single argument', () => {
    const message = '{name}';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "name",
          ],
        ]
      `);
    const result = formatMessage(compiled, 'en', {name: 'World'});
    expect(result).toMatchInlineSnapshot(`"World"`);
    expectMatchesIntlMessageFormat(message, 'en', {name: 'World'}, undefined, result);
  });

  it('formats text with an argument', () => {
    const message = 'Hello {name}';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`
        [
          "Hello ",
          [
            "name",
          ],
        ]
      `);
    const result = formatMessage(compiled, 'en', {name: 'World'});
    expect(result).toMatchInlineSnapshot(`"Hello World"`);
    expectMatchesIntlMessageFormat(message, 'en', {name: 'World'}, undefined, result);
  });

  it('formats multiple arguments', () => {
    const message = '{first} {last}';
    const compiled = compile(message);
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
    const result = formatMessage(compiled, 'en', {first: 'John', last: 'Doe'});
    expect(result).toMatchInlineSnapshot(`"John Doe"`);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {first: 'John', last: 'Doe'},
      undefined,
      result
    );
  });

  it('converts numbers to strings for simple arguments', () => {
    const message = '{val}';
    const compiled = compile(message);
    const result = formatMessage(compiled, 'en', {val: 1234});
    expect(result).toMatchInlineSnapshot(`"1234"`);
    const decimalResult = formatMessage(compiled, 'en', {val: 0.75});
    expect(decimalResult).toMatchInlineSnapshot(`"0.75"`);
    expectMatchesIntlMessageFormat(message, 'en', {val: 1234}, undefined, result);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {val: 0.75},
      undefined,
      decimalResult
    );
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
    const message = '{val, number}';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "val",
            4,
          ],
        ]
      `);
    const result = formatMessage(compiled, 'en', {val: 1234.5});
    expect(result).toMatchInlineSnapshot(`"1,234.5"`);
    expectMatchesIntlMessageFormat(message, 'en', {val: 1234.5}, undefined, result);
  });

  it('formats a percentage', () => {
    const message = '{val, number, percent}';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "val",
            4,
            "percent",
          ],
        ]
      `);
    const options: Omit<FormatOptions, 'formatters'> = {
      formats: {number: {percent: {style: 'percent'}}}
    };
    const result = formatMessage(compiled, 'en', {val: 0.75}, options);
    expect(result).toMatchInlineSnapshot(`"75%"`);
    expectMatchesIntlMessageFormat(message, 'en', {val: 0.75}, options, result);
  });

  it('formats an integer', () => {
    const message = '{val, number, integer}';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "val",
            4,
            "integer",
          ],
        ]
      `);
    const options: Omit<FormatOptions, 'formatters'> = {
      formats: {number: {integer: {maximumFractionDigits: 0}}}
    };
    const result = formatMessage(compiled, 'en', {val: 3.7}, options);
    expect(result).toMatchInlineSnapshot(`"4"`);
    expectMatchesIntlMessageFormat(message, 'en', {val: 3.7}, options, result);
  });

  it('formats numbers with a German locale', () => {
    const message = '{val, number}';
    const compiled = compile(message);
    const result = formatMessage(compiled, 'de', {val: 1234.5});
    expect(result).toMatchInlineSnapshot(`"1.234,5"`);
    expectMatchesIntlMessageFormat(message, 'de', {val: 1234.5}, undefined, result);
  });

  it('formats currency using skeleton syntax', () => {
    const message = '{price, number, ::currency/EUR}';
    const compiled = compile(message);
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
    const result = formatMessage(compiled, 'en', {price: 123.45});
    expect(result).toMatchInlineSnapshot(`"€123.45"`);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {price: 123.45},
      undefined,
      result
    );
  });

  it('formats unit using skeleton syntax', () => {
    const message = '{weight, number, ::unit/kilogram}';
    const compiled = compile(message);
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
    const result = formatMessage(compiled, 'en', {weight: 5});
    expect(result).toMatchInlineSnapshot(`"5 kg"`);
    expectMatchesIntlMessageFormat(message, 'en', {weight: 5}, undefined, result);
  });

  it('formats with decimal precision skeleton', () => {
    const message = '{val, number, ::.00}';
    const compiled = compile(message);
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
    const result = formatMessage(compiled, 'en', {val: 3.1});
    expect(result).toMatchInlineSnapshot(`"3.10"`);
    expectMatchesIntlMessageFormat(message, 'en', {val: 3.1}, undefined, result);
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
    const message = '{d, date, short}';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "d",
            5,
            "short",
          ],
        ]
      `);
    const options: Omit<FormatOptions, 'formatters'> = {
      formats: {
        date: {
          short: {month: 'numeric', day: 'numeric', year: '2-digit'}
        }
      }
    };
    const result = formatMessage(
      compiled,
      'en',
      {d: date},
      options
    );
    expect(result).toContain('3');
    expect(result).toContain('15');
    expectMatchesIntlMessageFormat(message, 'en', {d: date}, options, result);
  });

  it('formats a date with medium style', () => {
    const message = '{d, date, medium}';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "d",
            5,
            "medium",
          ],
        ]
      `);
    const options: Omit<FormatOptions, 'formatters'> = {
      formats: {
        date: {
          medium: {month: 'short', day: 'numeric', year: 'numeric'}
        }
      }
    };
    const result = formatMessage(
      compiled,
      'en',
      {d: date},
      options
    );
    expect(result).toContain('Mar');
    expectMatchesIntlMessageFormat(message, 'en', {d: date}, options, result);
  });

  describe('timeZone', () => {
    // 20:00 UTC = 05:00 next day in Tokyo
    const lateDate = new Date('2024-03-15T20:00:00Z');

    it('uses global timeZone', () => {
      const message = '{d, date, custom}';
      const compiled = compile(message);
      const options: Omit<FormatOptions, 'formatters'> = {
        timeZone: 'Asia/Tokyo',
        formats: {
          date: {custom: {year: 'numeric', month: 'short', day: 'numeric'}}
        }
      };
      const result = formatMessage(
        compiled,
        'en',
        {d: lateDate},
        options
      );
      expect(result).toMatchInlineSnapshot(`"Mar 16, 2024"`);
      expectMatchesIntlMessageFormat(message, 'en', {d: lateDate}, options, result);
    });

    it('prefers format-specific timeZone over global', () => {
      const message = '{d, date, utc}';
      const compiled = compile(message);
      const options: Omit<FormatOptions, 'formatters'> = {
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
      };
      const result = formatMessage(
        compiled,
        'en',
        {d: lateDate},
        options
      );
      expect(result).toMatchInlineSnapshot(`"Mar 15, 2024"`);
      expectMatchesIntlMessageFormat(message, 'en', {d: lateDate}, options, result);
    });
  });

  it('formats date using skeleton syntax', () => {
    const message = '{d, date, ::yyyy-MM-dd}';
    const compiled = compile(message);
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
    const options: Omit<FormatOptions, 'formatters'> = {timeZone: 'UTC'};
    const result = formatMessage(compiled, 'en', {d: date}, options);
    expect(result).toMatchInlineSnapshot(`"03/15/2024"`);
    expectMatchesIntlMessageFormat(message, 'en', {d: date}, options, result);
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
    const message = '{t, time, short}';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "t",
            6,
            "short",
          ],
        ]
      `);
    const options: Omit<FormatOptions, 'formatters'> = {
      formats: {
        time: {
          short: {hour: 'numeric', minute: 'numeric'}
        }
      }
    };
    const result = formatMessage(
      compiled,
      'en',
      {t: date},
      options
    );
    expect(typeof result).toBe('string');
    expectMatchesIntlMessageFormat(message, 'en', {t: date}, options, result);
  });

  describe('timeZone', () => {
    it('uses global timeZone', () => {
      const message = '{t, time, custom}';
      const compiled = compile(message);
      const options: Omit<FormatOptions, 'formatters'> = {
        timeZone: 'America/New_York',
        formats: {
          time: {custom: {hour: 'numeric', minute: 'numeric', hour12: false}}
        }
      };
      const result = formatMessage(
        compiled,
        'en',
        {t: date},
        options
      );
      expect(result).toMatchInlineSnapshot(`"10:30"`);
      expectMatchesIntlMessageFormat(message, 'en', {t: date}, options, result);
    });

    it('prefers format-specific timeZone over global', () => {
      const message = '{t, time, utc}';
      const compiled = compile(message);
      const options: Omit<FormatOptions, 'formatters'> = {
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
      };
      const result = formatMessage(
        compiled,
        'en',
        {t: date},
        options
      );
      expect(result).toMatchInlineSnapshot(`"14:30"`);
      expectMatchesIntlMessageFormat(message, 'en', {t: date}, options, result);
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
    const message =
      '{gender, select, female {She} male {He} other {They}}';
    const compiled = compile(message);
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
    const femaleResult = formatMessage(compiled, 'en', {gender: 'female'});
    expect(femaleResult).toMatchInlineSnapshot(`"She"`);
    const maleResult = formatMessage(compiled, 'en', {gender: 'male'});
    expect(maleResult).toMatchInlineSnapshot(`"He"`);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {gender: 'female'},
      undefined,
      femaleResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {gender: 'male'},
      undefined,
      maleResult
    );
  });

  it('falls back to other', () => {
    const message =
      '{gender, select, female {She} male {He} other {They}}';
    const compiled = compile(message);
    const result = formatMessage(compiled, 'en', {gender: 'unknown'});
    expect(result).toMatchInlineSnapshot(`"They"`);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {gender: 'unknown'},
      undefined,
      result
    );
  });

  it('formats arguments in branches', () => {
    const message =
      '{gender, select, female {{name} is a woman} other {{name} is a person}}';
    const compiled = compile(message);
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
    const result = formatMessage(compiled, 'en', {
      gender: 'female',
      name: 'Alice'
    });
    expect(result).toMatchInlineSnapshot(`"Alice is a woman"`);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {gender: 'female', name: 'Alice'},
      undefined,
      result
    );
  });

  it('formats multiple arguments in branches', () => {
    const message =
      '{gender, select, female {Dear Ms. {lastName}} male {Dear Mr. {lastName}} other {Dear {firstName} {lastName}}}';
    const compiled = compile(message);
    const femaleResult = formatMessage(compiled, 'en', {
      gender: 'female',
      firstName: 'Jane',
      lastName: 'Doe'
    });
    expect(femaleResult).toMatchInlineSnapshot(`"Dear Ms. Doe"`);
    const otherResult = formatMessage(compiled, 'en', {
      gender: 'other',
      firstName: 'Alex',
      lastName: 'Smith'
    });
    expect(otherResult).toMatchInlineSnapshot(`"Dear Alex Smith"`);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {gender: 'female', firstName: 'Jane', lastName: 'Doe'},
      undefined,
      femaleResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {gender: 'other', firstName: 'Alex', lastName: 'Smith'},
      undefined,
      otherResult
    );
  });

  it('throws for a select without other', () => {
    expect(() => compile('{gender, select, female {She} male {He}}')).toThrow(
      'MISSING_OTHER_CLAUSE'
    );
  });

  it('does not unwrap single tag nodes in branches', () => {
    // If a branch was unwrapped to a single array node (e.g. ["b","Hi"]),
    // the runtime would treat it as a list of nodes and never execute the tag.
    const message =
      '{gender, select, male {<b>Hi</b>} other {<b>Bye</b>}}';
    const compiled = compile(message);
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
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {gender: 'male', b: () => ({tag: 'b'})},
      undefined,
      result
    );
  });

  it('does not unwrap single typed nodes in branches', () => {
    // Same issue as above, but for typed nodes like ["value", 4].
    const message =
      '{gender, select, male {{value, number}} other {fallback}}';
    const compiled = compile(message);
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

    const options: Omit<FormatOptions, 'formatters'> = {formats: {number: {}}};
    const result = formatMessage(
      compiled,
      'en',
      {gender: 'male', value: 1234},
      options
    );
    expect(result).toBe('1,234');
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {gender: 'male', value: 1234},
      options,
      result
    );
  });
});

describe('cardinal plural (plural)', () => {
  it('formats plural with one/other', () => {
    const message = '{count, plural, one {# item} other {# items}}';
    const compiled = compile(message);
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
    const oneResult = formatMessage(compiled, 'en', {count: 1});
    expect(oneResult).toMatchInlineSnapshot(`"1 item"`);
    const manyResult = formatMessage(compiled, 'en', {count: 5});
    expect(manyResult).toMatchInlineSnapshot(`"5 items"`);
    const zeroResult = formatMessage(compiled, 'en', {count: 0});
    expect(zeroResult).toMatchInlineSnapshot(`"0 items"`);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {count: 1},
      undefined,
      oneResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {count: 5},
      undefined,
      manyResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {count: 0},
      undefined,
      zeroResult
    );
  });

  it('uses exact matches over plural rules', () => {
    const message =
      '{count, plural, =0 {no items} =1 {one item} one {# item} other {# items}}';
    const compiled = compile(message);
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
    const zeroResult = formatMessage(compiled, 'en', {count: 0});
    expect(zeroResult).toMatchInlineSnapshot(`"no items"`);
    const oneResult = formatMessage(compiled, 'en', {count: 1});
    expect(oneResult).toMatchInlineSnapshot(`"one item"`);
    const twoResult = formatMessage(compiled, 'en', {count: 2});
    expect(twoResult).toMatchInlineSnapshot(`"2 items"`);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {count: 0},
      undefined,
      zeroResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {count: 1},
      undefined,
      oneResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {count: 2},
      undefined,
      twoResult
    );
  });

  it('formats the pound sign with the locale', () => {
    const message = '{count, plural, one {# item} other {# items}}';
    const compiled = compile(message);
    const result = formatMessage(compiled, 'de', {count: 1000});
    expect(result).toMatchInlineSnapshot(`"1.000 items"`);
    expectMatchesIntlMessageFormat(
      message,
      'de',
      {count: 1000},
      undefined,
      result
    );
  });

  it('uses Polish plural rules', () => {
    // Polish: 1 = one, 2-4 = few, 5-21 = many, 22-24 = few, etc.
    const message =
      '{n, plural, one {# plik} few {# pliki} many {# plików} other {# pliku}}';
    const compiled = compile(message);
    const oneResult = formatMessage(compiled, 'pl', {n: 1});
    expect(oneResult).toMatchInlineSnapshot(`"1 plik"`);
    const fewResult = formatMessage(compiled, 'pl', {n: 2});
    expect(fewResult).toMatchInlineSnapshot(`"2 pliki"`);
    const manyResult = formatMessage(compiled, 'pl', {n: 5});
    expect(manyResult).toMatchInlineSnapshot(`"5 plików"`);
    const otherResult = formatMessage(compiled, 'pl', {n: 22});
    expect(otherResult).toMatchInlineSnapshot(`"22 pliki"`);
    expectMatchesIntlMessageFormat(
      message,
      'pl',
      {n: 1},
      undefined,
      oneResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'pl',
      {n: 2},
      undefined,
      fewResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'pl',
      {n: 5},
      undefined,
      manyResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'pl',
      {n: 22},
      undefined,
      otherResult
    );
  });

  it('throws for a plural without other', () => {
    expect(() => compile('{count, plural, one {item}}')).toThrow(
      'MISSING_OTHER_CLAUSE'
    );
  });

  it('throws for plural offsets', () => {
    expect(() =>
      compile('{count, plural, offset:1 one {# item} other {# items}}')
    ).toThrow('Plural offsets are not supported');
  });
});

describe('ordinal plural (selectordinal)', () => {
  it('formats ordinals in English', () => {
    const message =
      '{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}';
    const compiled = compile(message);
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
    const firstResult = formatMessage(compiled, 'en', {n: 1});
    expect(firstResult).toMatchInlineSnapshot(`"1st"`);
    const secondResult = formatMessage(compiled, 'en', {n: 2});
    expect(secondResult).toMatchInlineSnapshot(`"2nd"`);
    const thirdResult = formatMessage(compiled, 'en', {n: 3});
    expect(thirdResult).toMatchInlineSnapshot(`"3rd"`);
    const fourthResult = formatMessage(compiled, 'en', {n: 4});
    expect(fourthResult).toMatchInlineSnapshot(`"4th"`);
    const elevenResult = formatMessage(compiled, 'en', {n: 11});
    expect(elevenResult).toMatchInlineSnapshot(`"11th"`);
    const twentyOneResult = formatMessage(compiled, 'en', {n: 21});
    expect(twentyOneResult).toMatchInlineSnapshot(`"21st"`);
    expectMatchesIntlMessageFormat(message, 'en', {n: 1}, undefined, firstResult);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {n: 2},
      undefined,
      secondResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {n: 3},
      undefined,
      thirdResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {n: 4},
      undefined,
      fourthResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {n: 11},
      undefined,
      elevenResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {n: 21},
      undefined,
      twentyOneResult
    );
  });
});

describe('tags', () => {
  it('calls a tag handler with children', () => {
    const message = '<bold>important</bold>';
    const compiled = compile(message);
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "bold",
            "important",
          ],
        ]
      `);
    const values = {bold: (chunks: Array<string>) => `<b>${chunks.join('')}</b>`};
    const result = formatMessage(compiled, 'en', values);
    expect(result).toMatchInlineSnapshot(`"<b>important</b>"`);
    expectMatchesIntlMessageFormat(message, 'en', values, undefined, result);
  });

  it('handles an empty tag', () => {
    const message = '<br></br>';
    const compiled = compile(message);
    // Empty tags get an empty string child to distinguish from simple arguments
    expect(compiled).toMatchInlineSnapshot(`
        [
          [
            "br",
            "",
          ],
        ]
      `);
    const values = {br: () => '<br/>'};
    const result = formatMessage(compiled, 'en', values);
    expect(result).toMatchInlineSnapshot(`"<br/>"`);
    expectMatchesIntlMessageFormat(message, 'en', values, undefined, result);
  });

  it('handles a tag with an argument', () => {
    const message = '<link>{name}</link>';
    const compiled = compile(message);
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
    const values = {
      name: 'Click here',
      link: (chunks: Array<string>) => `<a>${chunks.join('')}</a>`
    };
    const result = formatMessage(compiled, 'en', values);
    expect(result).toMatchInlineSnapshot(`"<a>Click here</a>"`);
    expectMatchesIntlMessageFormat(message, 'en', values, undefined, result);
  });

  it('handles a tag with a pound sign', () => {
    const message =
      '{count, plural, one {<bold>#</bold>} other {<bold>#</bold>}}';
    const compiled = compile(message);
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
    const values = {
      bold: (chunks: Array<string>) => `<b>${chunks.join('')}</b>`,
      count: 2
    };
    const result = formatMessage(compiled, 'en', values);
    expect(result).toMatchInlineSnapshot(`"<b>2</b>"`);
    expectMatchesIntlMessageFormat(message, 'en', values, undefined, result);
  });

  it('supports tags returning non-strings', () => {
    const message = 'Hello <bold>{name}</bold>';
    const compiled = compile(message);
    const boldElement = {type: 'bold', children: ['World']};
    const values = {
      name: 'World',
      bold: () => boldElement
    };
    const result = formatMessage(compiled, 'en', values);
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
    expectMatchesIntlMessageFormat(message, 'en', values, undefined, result);
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
      const message = 'Hello <a>foo <b>text</b></a>!';
      const compiled = compile(message);
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

      const values = {
        b: (chunks: Array<string | ReactElement>) => ({
          type: 'b',
          props: {children: chunks}
        }),
        a: (chunks: Array<string | ReactElement>) => ({
          type: 'a',
          props: {children: chunks}
        })
      };
      const result = formatMessage<ReactElement>(compiled, 'en', values);
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
      expectMatchesIntlMessageFormat<ReactElement>(
        message,
        'en',
        values,
        undefined,
        result
      );
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
    const message =
      '{count, plural, one {{gender, select, female {her item} other {their item}}} other {{gender, select, female {her items} other {their items}}}}';
    const compiled = compile(message);
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
    const oneResult = formatMessage(compiled, 'en', {
      count: 1,
      gender: 'female'
    });
    expect(oneResult).toMatchInlineSnapshot(`"her item"`);
    const manyResult = formatMessage(compiled, 'en', {
      count: 5,
      gender: 'female'
    });
    expect(manyResult).toMatchInlineSnapshot(`"her items"`);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {count: 1, gender: 'female'},
      undefined,
      oneResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {count: 5, gender: 'female'},
      undefined,
      manyResult
    );
  });

  it('formats a plural inside a select', () => {
    const message =
      '{gender, select, female {{n, plural, one {She has # cat} other {She has # cats}}} other {{n, plural, one {They have # cat} other {They have # cats}}}}';
    const compiled = compile(message);
    const femaleOneResult = formatMessage(compiled, 'en', {
      gender: 'female',
      n: 1
    });
    expect(femaleOneResult).toMatchInlineSnapshot(`"She has 1 cat"`);
    const femaleManyResult = formatMessage(compiled, 'en', {
      gender: 'female',
      n: 3
    });
    expect(femaleManyResult).toMatchInlineSnapshot(`"She has 3 cats"`);
    const otherOneResult = formatMessage(compiled, 'en', {
      gender: 'other',
      n: 1
    });
    expect(otherOneResult).toMatchInlineSnapshot(`"They have 1 cat"`);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {gender: 'female', n: 1},
      undefined,
      femaleOneResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {gender: 'female', n: 3},
      undefined,
      femaleManyResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {gender: 'other', n: 1},
      undefined,
      otherOneResult
    );
  });

  it('formats deeply nested structures', () => {
    const message =
      '{a, select, x {{b, plural, one {{c, select, y {deep} other {nested}}} other {level}}} other {top}}';
    const compiled = compile(message);
    const deepResult = formatMessage(compiled, 'en', {a: 'x', b: 1, c: 'y'});
    expect(deepResult).toMatchInlineSnapshot(`"deep"`);
    const nestedResult = formatMessage(compiled, 'en', {a: 'x', b: 1, c: 'z'});
    expect(nestedResult).toMatchInlineSnapshot(`"nested"`);
    const levelResult = formatMessage(compiled, 'en', {a: 'x', b: 2, c: 'y'});
    expect(levelResult).toMatchInlineSnapshot(`"level"`);
    const topResult = formatMessage(compiled, 'en', {a: 'z', b: 1, c: 'y'});
    expect(topResult).toMatchInlineSnapshot(`"top"`);
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {a: 'x', b: 1, c: 'y'},
      undefined,
      deepResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {a: 'x', b: 1, c: 'z'},
      undefined,
      nestedResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {a: 'x', b: 2, c: 'y'},
      undefined,
      levelResult
    );
    expectMatchesIntlMessageFormat(
      message,
      'en',
      {a: 'z', b: 1, c: 'y'},
      undefined,
      topResult
    );
  });

  it('formats tags with plural and arguments', () => {
    const message =
      'Welcome, <bold>{name}</bold>! You have <link>{count, plural, one {# message} other {# messages}}</link>.';
    const compiled = compile(message);
    const values = {
      name: 'Alice',
      count: 5,
      bold: (chunks: Array<string>) => `<strong>${chunks.join('')}</strong>`,
      link: (chunks: Array<string>) =>
        `<a href="/messages">${chunks.join('')}</a>`
    };
    const result = formatMessage(compiled, 'en', values);
    expect(result).toMatchInlineSnapshot(
      `"Welcome, <strong>Alice</strong>! You have <a href="/messages">5 messages</a>."`
    );
    expectMatchesIntlMessageFormat(message, 'en', values, undefined, result);
  });
});
