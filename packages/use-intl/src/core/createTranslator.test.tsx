import {isValidElement} from 'react';
import {renderToString} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import type {Messages} from './AppConfig.tsx';
import type IntlError from './IntlError.tsx';
import IntlErrorCode from './IntlErrorCode.tsx';
import createTranslator from './createTranslator.tsx';

const messages = {
  Home: {
    title: 'Hello world!',
    rich: '<b>Hello <i>{name}</i>!</b>',
    markup: '<b>Hello <i>{name}</i>!</b>'
  }
} as const;

it('can translate a message within a namespace', () => {
  const t = createTranslator({
    locale: 'en',
    namespace: 'Home',
    messages
  });

  expect(t('title')).toBe('Hello world!');
});

it('can translate a message without a namespace', () => {
  const t = createTranslator({
    locale: 'en',
    messages
  });
  expect(t('Home.title')).toBe('Hello world!');
});

it('handles formatting errors', () => {
  const onError = vi.fn();

  const t = createTranslator({
    locale: 'en',
    messages: {price: '{value}'},
    onError
  });

  // @ts-expect-error
  const result = t('price');

  const error: IntlError = onError.mock.calls[0][0];
  expect(error.message).toBe(
    'FORMATTING_ERROR: The intl string context variable "value" was not provided to the string "{value}"'
  );
  expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);

  expect(result).toBe('price');
});

it('supports alphanumeric value names', () => {
  const t = createTranslator({
    locale: 'en',
    messages: {label: '{val_u3}'}
  });

  const result = t('label', {val_u3: 'Hello'});
  expect(result).toBe('Hello');
});

it('throws an error for non-alphanumeric value names', () => {
  const onError = vi.fn();

  const t = createTranslator({
    locale: 'en',
    messages: {label: '{val-u3}'},
    onError
  });

  t('label', {'val-u3': 'Hello'});
  const error: IntlError = onError.mock.calls[0][0];
  expect(error.code).toBe('INVALID_MESSAGE');
});

it('can handle nested blocks in selects', () => {
  const t = createTranslator({
    locale: 'en',
    messages: {
      label:
        '{foo, select, one {One: {one}} two {Two: {two}} other {Other: {other}}}'
    }
  });
  expect(
    t('label', {
      foo: 'one',
      one: 'One',
      two: 'Two',
      other: 'Other'
    })
  ).toBe('One: One');
});

it('can handle nested blocks in plurals', () => {
  const t = createTranslator({
    locale: 'en',
    messages: {
      label: '{count, plural, one {One: {one}} other {Other: {other}}}'
    }
  });
  expect(t('label', {count: 1, one: 'One', other: 'Other'})).toBe('One: One');
});

describe('type safety', () => {
  describe('keys, strictly-typed', () => {
    it('allows valid namespaces', () => {
      createTranslator({
        locale: 'en',
        messages,
        namespace: 'Home'
      });
    });

    it('allows valid keys', () => {
      const t = createTranslator({
        locale: 'en',
        messages,
        namespace: 'Home'
      });

      t('title');
      t.has('title');
      t.markup('title');
      t.rich('title');
    });

    it('allows an undefined namespace with a valid key', () => {
      const t = createTranslator({
        locale: 'en',
        messages
      });
      t('Home.title');
    });

    it('disallows an undefined namespace with an invalid key', () => {
      const t = createTranslator({
        locale: 'en',
        messages
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t('unknown');
        // @ts-expect-error
        t.has('unknown');
        // @ts-expect-error
        t.markup('unknown');
        // @ts-expect-error
        t.rich('unknown');
      };
    });

    it('disallows invalid namespaces', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        createTranslator<typeof messages>({
          locale: 'en',
          messages,
          // @ts-expect-error
          namespace: 'unknown'
        });
      };
    });

    it('disallows invalid keys', () => {
      const t = createTranslator({
        locale: 'en',
        messages,
        namespace: 'Home'
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t('unknown');
        // @ts-expect-error
        t.has('unknown');
        // @ts-expect-error
        t.markup('unknown');
        // @ts-expect-error
        t.rich('unknown');
      };
    });
  });

  describe('keys, untyped', () => {
    it('allows any namespace', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        createTranslator({
          locale: 'en',
          messages: messages as Messages,
          namespace: 'unknown'
        });
      };
    });

    it('allows any key', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        const t = createTranslator({
          locale: 'en',
          messages: messages as Messages
        });
        t('unknown');
      };
    });
  });

  describe('params, strictly-typed', () => {
    function translateMessage<const T extends string>(msg: T) {
      return createTranslator({
        locale: 'en',
        messages: {msg}
      });
    }

    it('validates plain params', () => {
      const t = translateMessage('Hello {name}');

      t('msg', {name: 'Jane'});

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t('msg', {unknown: 'Jane'});
        // @ts-expect-error
        t('msg');
      };
    });

    it('can handle undefined values', () => {
      const t = translateMessage('Hello {name}');

      const obj = {
        name: 'Jane',
        age: undefined
      };
      t('msg', obj);
    });

    it('validates cardinal plurals', () => {
      const t = translateMessage(
        'You have {count, plural, =0 {no followers yet} =1 {one follower} other {# followers}}.'
      );

      t('msg', {count: 0});

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t('msg', {unknown: 1.5});
        // @ts-expect-error
        t('msg');
      };
    });

    it('validates ordinal plurals', () => {
      const t = translateMessage(
        "It's your {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!"
      );

      t('msg', {year: 1});

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t('msg', {unknown: 1});
        // @ts-expect-error
        t('msg');
      };
    });

    it('validates selects', () => {
      const t = translateMessage(
        '{gender, select, female {She} male {He} other {They}} is online.'
      );

      t('msg', {gender: 'female'});

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t('msg', {unknown: 'female'});
        // @ts-expect-error
        t('msg');
      };
    });

    it('validates nested selects', () => {
      const t = translateMessage(
        '{foo, select, one {One: {one}} two {Two: {two}} other {Other: {other}}}'
      );

      t('msg', {
        foo: 'one',
        one: 'One',
        two: 'Two',
        other: 'Other'
      });
      t('msg', {foo: 'one', one: 'One'}); // Only `one` is required
      t('msg', {foo: 'one', one: 'One', two: 'Two'}); // …but `two` is also allowed
      t('msg', {foo: 'two', two: 'Two'});

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t('msg', {foo: 'unknown' as string, other: 'Other'});
        // @ts-expect-error
        t('msg', {unknown: 'one'});
        // @ts-expect-error
        t('msg');
      };
    });

    it('validates escaped', () => {
      const t = translateMessage(
        "Escape curly braces with single quotes (e.g. '{name')"
      );

      t('msg');

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t('msg', {name: 'Jane'});
      };
    });

    it('validates simple rich text', () => {
      const t = translateMessage(
        'Please refer to <guidelines>the guidelines</guidelines>.'
      );

      t.rich('msg', {guidelines: (chunks) => <p>{chunks}</p>});
      t.markup('msg', {guidelines: (chunks) => `<p>${chunks}</p>`});

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t.rich('msg', {guidelines: 'test'});
        // @ts-expect-error
        t.rich('msg', {unknown: (chunks) => <p>{chunks}</p>});
        // @ts-expect-error
        t.rich('msg', {unknown: 'test'});
        // @ts-expect-error
        t.rich('msg');
      };
    });

    it('validates nested rich text', () => {
      const t = translateMessage(
        'This is <important><very>very</very> important</important>'
      );

      t.rich('msg', {
        important: (chunks) => <strong>{chunks}</strong>,
        very: (chunks) => <i>{chunks}</i>
      });
      t.markup('msg', {
        important: (chunks) => `<strong>${chunks}</strong>`,
        very: (chunks) => `<i>${chunks}</i>`
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t.rich('msg', {important: (chunks) => <p>{chunks}</p>});
        // @ts-expect-error
        t.rich('msg', {important: 'test', very: 'test'});
        // @ts-expect-error
        t.rich('msg', {unknown: 'test'});
        // @ts-expect-error
        t.rich('msg');
      };
    });

    it('validates a complex message', () => {
      const t = translateMessage(
        'Hello <user>{name}</user>, you have {count, plural, =0 {no followers} =1 {one follower} other {# followers ({count})}}.'
      );

      t.rich('msg', {
        name: 'Jane',
        count: 2,
        user: (chunks) => <p>{chunks}</p>
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t.rich('msg', {
          name: 'Jane',
          user: (chunks) => <p>{chunks}</p>
        });
        t.rich('msg', {
          // @ts-expect-error
          user: 'Jane',
          // @ts-expect-error
          name: (chunks) => <p>{chunks}</p>,
          count: 2
        });
      };
    });

    describe('disallowed params', () => {
      const t = createTranslator({
        locale: 'en',
        messages: {
          simpleParam: 'Hello {name}',
          pluralMessage:
            'You have {count, plural, =0 {no followers} =1 {one follower} other {# followers}}.',
          ordinalMessage:
            "It's your {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",
          selectMessage:
            '{gender, select, female {She} male {He} other {They}} is online.',
          escapedParam:
            "Escape curly braces with single quotes (e.g. '{name'})",
          simpleRichText:
            'Please refer to <guidelines>the guidelines</guidelines>.',
          nestedRichText:
            'This is <important><very>very</very> important</important>'
        }
      });

      it("doesn't allow params for `has`", () => {
        t.has('simpleParam');
        t.has('pluralMessage');
        t.has('ordinalMessage');
        t.has('selectMessage');
        t.has('escapedParam');
        t.has('simpleRichText');
        t.has('nestedRichText');

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        () => {
          // @ts-expect-error
          t.has('simpleParam', {name: 'Jane'});
          // @ts-expect-error
          t.has('pluralMessage', {count: 0});
          // @ts-expect-error
          t.has('ordinalMessage', {year: 1});
          // @ts-expect-error
          t.has('selectMessage', {gender: 'female'});
          // @ts-expect-error
          t.has('simpleRichText', {guidelines: (chunks) => <p>{chunks}</p>});
          // @ts-expect-error
          t.has('nestedRichText', {
            important: (chunks: any) => <strong>{chunks}</strong>
          });
        };
      });

      it("doesn't allow params for `raw`", () => {
        t.raw('simpleParam');
        t.raw('pluralMessage');
        t.raw('ordinalMessage');
        t.raw('selectMessage');
        t.raw('escapedParam');
        t.raw('simpleRichText');
        t.raw('nestedRichText');

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        () => {
          // @ts-expect-error
          t.raw('simpleParam', {name: 'Jane'});
          // @ts-expect-error
          t.raw('pluralMessage', {count: 0});
          // @ts-expect-error
          t.raw('ordinalMessage', {year: 1});
          // @ts-expect-error
          t.raw('selectMessage', {gender: 'female'});
          // @ts-expect-error
          t.raw('simpleRichText', {guidelines: (chunks) => <p>{chunks}</p>});
          // @ts-expect-error
          t.raw('nestedRichText', {
            important: (chunks: any) => <strong>{chunks}</strong>
          });
        };
      });
    });
  });

  describe('params, untyped', () => {
    it('allows passing no values', () => {
      const t = createTranslator({
        locale: 'en',
        messages: messages as Messages
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        t('param');
        t.rich('param');
        t.markup('param');
        t.raw('param');
        t.has('param');
      };
    });

    it('allows passing any values', () => {
      const t = createTranslator({
        locale: 'en',
        messages: messages as Messages
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        t('param', {unknown: 'Jane'});
        t.rich('param', {unknown: 'Jane', p: (chunks) => <p>{chunks}</p>});
        t.markup('param', {unknown: 'Jane', p: (chunks) => `<p>${chunks}</p>`});
      };
    });

    it('limits values where relevant', () => {
      const t = createTranslator({
        locale: 'en',
        messages: messages as Messages
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        // @ts-expect-error
        t('param', {p: (chunks) => <p>{chunks}</p>});
        // @ts-expect-error
        t('param', {p: (chunks) => `<p>${chunks}</p>`});

        // @ts-expect-error
        t.markup('param', {unknown: 'Jane', p: (chunks) => <p>{chunks}</p>});

        // @ts-expect-error
        t.raw('param', {unknown: 'Jane'});
        // @ts-expect-error
        t.has('param', {unknown: 'Jane'});
      };
    });
  });
});

describe('numbers in messages', () => {
  it('can pass an inline format', () => {
    const t = createTranslator({
      locale: 'en',
      messages: {label: '{count, number, precise}'}
    });
    expect(
      t('label', {count: 1.5}, {number: {precise: {minimumFractionDigits: 5}}})
    ).toBe('1.50000');
  });

  it('can merge an inline format with global formats', () => {
    const t = createTranslator({
      locale: 'en',
      messages: {label: '{count, number, precise} {count, number, integer}'},
      formats: {number: {precise: {minimumFractionDigits: 5}}}
    });
    expect(
      t('label', {count: 1.5}, {number: {integer: {minimumFractionDigits: 0}}})
    ).toBe('1.50000 2');
  });
});

describe('dates in messages', () => {
  it.each([
    ['G', '7/9/2024 AD'], // 🤔 Includes date
    ['GG', '7/9/2024 AD'], // 🤔 Includes date
    ['GGGG', '7/9/2024 Anno Domini'], // 🤔 Includes date
    ['GGGGG', '7/9/2024 A'], // 🤔 Includes date

    ['y', '2024'],
    ['yy', '24'],
    ['yyyy', '2024'],

    ['M', '7'],
    ['MM', '07'],
    ['MMM', 'Jul'],
    ['MMMM', 'July'],
    ['MMMMM', 'J'],

    // Same as M
    ['L', '7'],
    ['LL', '07'],
    ['LLL', 'Jul'],
    ['LLLL', 'July'],
    ['LLLLL', 'J'],

    ['d', '9'],
    ['dd', '09'],

    ['E', 'Tue'],
    ['EE', 'Tue'],
    ['EEE', 'Tue'],
    ['EEEE', 'Tuesday'],
    ['EEEEE', 'T'],
    // ['e', '7'] // 🤔 Not supported
    // ['ee', '07'] // 🤔 Not supported
    // ['eee', 'Jul'] // 🤔 Not supported

    // ['eeee', 'Tuesday'], // ❌ "Tue"
    // ['eeeee', 'T'], // ❌ "Tuesday"
    // ['eeeeee', 'Tu'] // ❌ "T"

    // ['c', '7'] // 🤔 Not supported
    // ['cc', '07'], // 🤔 Not supported
    // ['ccc', 'Jul'] // 🤔 Not supported

    // ['cccc', 'Tuesday'] // ❌ "Tue"
    // ['ccccc', 'T'], // ❌ "Tuesday"
    // ['cccccc', 'Tu'] // ❌ "T"

    // 🤔 Only in combination with time?
    // ['a', 'PM'] // ❌ "7/9/2024"
    // ['aa', 'PM'] // ❌ "7/9/2024"
    // ['aaa', 'PM'] // ❌ "7/9/2024"
    // ['aaaa', 'PM'] // ❌ "7/9/2024"
    // ['aaaaa', 'PM'] // ❌ "7/9/2024"

    ['h', '12 AM', '2024-07-09T22:00:00.000Z'],
    ['h', '9 AM'],
    ['hh', '09 AM'],

    // ['H', '9'], // ❌ "09"
    ['HH', '09'],
    ['HH', '00', '2024-07-09T22:00:00.000Z'],

    ['K', '0 AM', '2024-07-09T22:00:00.000Z'],
    ['KK', '00 AM', '2024-07-09T22:00:00.000Z'],
    ['K', '9 AM'],
    ['KK', '09 AM'],

    // ['k', '9'], // ❌ "09"
    ['kk', '09'],
    ['kk', '24', '2024-07-09T22:00:00.000Z'],

    ['m', '6'],
    // ['mm', '06'] // ❌ "6"

    ['s', '3'],
    // ['ss', '03'], // ❌ "3"
    ['mmss', '06:03'],

    ['z', '7/9/2024, GMT+2'], // 🤔 Includes date
    ['zz', '7/9/2024, GMT+2'], // 🤔 Includes date
    ['zzz', '7/9/2024, GMT+2'], // 🤔 Includes date
    ['zzzz', '7/9/2024, Central European Summer Time'], // 🤔 Includes date

    ['yyyyMMMd', 'Jul 9, 2024'],
    [
      'GGGGyyyyMMMMEdhmszzzz',
      'Tue, July 9, 2024 Anno Domini at 9:06:03 AM Central European Summer Time'
    ]
  ])('%s: %s', (value, expected, dateString = '2024-07-09T07:06:03.320Z') => {
    const date = new Date(dateString);
    const t = createTranslator({
      locale: 'en',
      messages: {date: `{date, date, ::${value}}`}
    });
    expect(t('date', {date})).toBe(expected);
  });

  it('can set a time zone in a built-in default format', () => {
    const t = createTranslator({
      locale: 'en',
      messages: {date: `{date, time, full}`},
      timeZone: 'Asia/Kolkata'
    });
    expect(t('date', {date: new Date('2023-12-31T18:30:00.000Z')})).toBe(
      '12:00:00 AM GMT+5:30'
    );
  });
});

describe('t.rich', () => {
  it('can translate a message to a ReactNode', () => {
    const t = createTranslator({
      locale: 'en',
      namespace: 'Home',
      messages
    });

    const result = t.rich('rich', {
      name: 'world',
      b: (chunks) => <b>{chunks}</b>,
      i: (chunks) => <i>{chunks}</i>
    });

    expect(isValidElement(result)).toBe(true);
    expect(renderToString(result as any)).toBe('<b>Hello <i>world</i>!</b>');
  });
});

describe('t.markup', () => {
  it('can translate a message', () => {
    const t = createTranslator({
      locale: 'en',
      namespace: 'Home',
      messages
    });

    expect(
      t.markup('markup', {
        name: 'world',
        b: (chunks) => `<b>${chunks}</b>`,
        i: (chunks) => `<i>${chunks}</i>`
      })
    ).toBe('<b>Hello <i>world</i>!</b>');
  });

  it('handles errors when React components are provided', () => {
    const onError = vi.fn();

    const t = createTranslator({
      locale: 'en',
      namespace: 'Home',
      messages,
      onError
    });

    const result = t.markup('markup', {
      name: 'world',
      // @ts-expect-error Intentionally broken call site
      b: (chunks) => <b>{chunks}</b>,
      // @ts-expect-error Intentionally broken call site
      i: (chunks) => <i>{chunks}</i>
    });

    expect(onError).toHaveBeenCalledTimes(1);
    const error: IntlError = onError.mock.calls[0][0];
    expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);
    expect(error.message).toBe(
      "FORMATTING_ERROR: `t.markup` only accepts functions for formatting that receive and return strings.\n\nE.g. t.markup('markup', {b: (chunks) => `<b>${chunks}</b>`})"
    );
    expect(result).toBe('Home.markup');
  });
});

describe('t.raw', () => {
  it('can retrieve a message', () => {
    const t = createTranslator({
      locale: 'en',
      namespace: 'Home',
      messages
    });

    expect(t.raw('rich')).toBe('<b>Hello <i>{name}</i>!</b>');
  });
});
