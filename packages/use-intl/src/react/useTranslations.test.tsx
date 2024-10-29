import {render, renderHook, screen} from '@testing-library/react';
import {parseISO} from 'date-fns';
import {IntlMessageFormat} from 'intl-messageformat';
import {ComponentProps, PropsWithChildren, ReactNode} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  Formats,
  IntlError,
  IntlErrorCode,
  RichTranslationValues,
  TranslationValues
} from '../core.tsx';
import IntlProvider from './IntlProvider.tsx';
import useTranslations from './useTranslations.tsx';

// Wrap the library to include a counter for parse
// invocations for the cache test below.
vi.mock('intl-messageformat', async (importOriginal) => {
  const ActualIntlMessageFormat: typeof IntlMessageFormat = (
    (await importOriginal()) as any
  ).IntlMessageFormat;

  return {
    IntlMessageFormat: class MockIntlMessageFormat extends ActualIntlMessageFormat {
      public static invocationsByMessage: Record<string, number> = {};

      constructor(
        ...[message, ...rest]: ConstructorParameters<typeof IntlMessageFormat>
      ) {
        if (typeof message !== 'string') {
          throw new Error('Unsupported invocation for testing.');
        }

        super(message, ...rest);

        MockIntlMessageFormat.invocationsByMessage[message] ||= 0;
        MockIntlMessageFormat.invocationsByMessage[message]++;
      }
    }
  };
});

function renderMessage(
  message: string,
  values?: TranslationValues,
  formats?: Formats,
  providerProps?: Partial<ComponentProps<typeof IntlProvider>>
) {
  function Component() {
    const t = useTranslations();
    return <>{t('message', values, formats)}</>;
  }

  return render(
    <IntlProvider
      formats={{dateTime: {time: {hour: 'numeric', minute: '2-digit'}}}}
      locale="en"
      messages={{message}}
      timeZone="Etc/UTC"
      {...providerProps}
    >
      <Component />
    </IntlProvider>
  );
}

it('handles static messages', () => {
  renderMessage('Hello');
  screen.getByText('Hello');
});

it('handles basic interpolation', () => {
  renderMessage('Hello {name}', {name: 'Jane'});
  screen.getByText('Hello Jane');
});

it('can escape curly brackets', () => {
  renderMessage("Hello '{name'}");
  screen.getByText('Hello {name}');
});

it('handles number formatting with percent', () => {
  renderMessage('{value, number, percent}', {value: 0.312});
  screen.getByText('31%');
});

it('handles number formatting with a static currency', () => {
  renderMessage('{price, number, ::currency/EUR}', {price: 123394.1243});
  screen.getByText('€123,394.12');
});

it('handles number formatting with defined decimals', () => {
  renderMessage('{value, number, ::.#}', {value: 123394.1243});
  screen.getByText('123,394.1');
});

it('handles number formatting with a custom format', () => {
  renderMessage(
    '{price, number, currency}',
    {
      price: 123394.1243
    },
    {
      number: {
        currency: {
          style: 'currency',
          currency: 'EUR'
        }
      }
    }
  );
  screen.getByText('€123,394.12');
});

it('handles date formatting', () => {
  renderMessage('{now, date, medium}', {
    now: parseISO('2020-11-19T15:38:43.700Z')
  });
  screen.getByText('Nov 19, 2020');
});

it('applies a time zone for provided formats', () => {
  renderMessage('{now, time, time}', {
    now: parseISO('2020-11-19T15:38:43.700Z')
  });
});

it('applies a time zone when using a built-in format', () => {
  function expectFormatted(
    style: 'time' | 'date',
    format: 'full' | 'long' | 'medium' | 'short',
    result: string
  ) {
    const now = parseISO('2023-05-08T22:50:16.879Z');
    const {unmount} = renderMessage(`{now, ${style}, ${format}}`, {now});
    screen.getByText(result);
    unmount();
  }

  expectFormatted('time', 'full', '10:50:16 PM UTC');
  expectFormatted('time', 'long', '10:50:16 PM UTC');
  expectFormatted('time', 'medium', '10:50:16 PM');
  expectFormatted('time', 'short', '10:50 PM');

  expectFormatted('date', 'full', 'Monday, May 8, 2023');
  expectFormatted('date', 'long', 'May 8, 2023');
  expectFormatted('date', 'medium', 'May 8, 2023');
  expectFormatted('date', 'short', '5/8/23');
});

it('applies a time zone when using a skeleton', () => {
  const now = new Date('2024-01-01T00:00:00.000+0530');
  renderMessage(`{now, date, ::yyyyMdHm}`, {now}, undefined, {
    timeZone: 'Asia/Kolkata'
  });
  screen.getByText('1/1/2024, 00:00');
});

it('supports pluralisation via specific numbers', () => {
  renderMessage(
    'You have {numMessages, plural, =0 {no messages} =1 {one message} other {# messages}}.',
    {numMessages: 1}
  );
  screen.getByText('You have one message.');
});

it('supports pluralisation via tags like "zero" and "one" if the locale supports it', () => {
  renderMessage(
    'Jums ir {count, plural, zero {vēl nav sekotāju} one {viens sekotājs} other {# sekotāji}}.',
    {count: 0},
    undefined,
    {
      locale: 'lv'
    }
  );
  screen.getByText('Jums ir vēl nav sekotāju.');
});

it('handles selects', () => {
  renderMessage(
    '{gender, select, male {He} female {She} other {They}} is online.',
    {gender: 'female'}
  );
  screen.getByText('She is online.');
});

it('handles selectordinals', () => {
  renderMessage(
    "It's my cat's {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",
    {year: 21}
  );
  screen.getByText("It's my cat's 21st birthday!");
});

it('can use messages in attributes', () => {
  function Component() {
    const t = useTranslations();
    return <a href={t('message')}>Hello</a>;
  }

  const {container} = render(
    <IntlProvider locale="en" messages={{message: 'https://example.com'}}>
      <Component />
    </IntlProvider>
  );

  expect(container.innerHTML).toBe('<a href="https://example.com">Hello</a>');
});

it('can resolve nested paths', () => {
  function Component() {
    const t = useTranslations('nested');
    return <p>{t('moreNesting.label')}</p>;
  }

  render(
    <IntlProvider
      locale="en"
      messages={{nested: {moreNesting: {label: 'Nested'}}}}
    >
      <Component />
    </IntlProvider>
  );

  screen.getByText('Nested');
});

it('allows empty messages', () => {
  const {container} = renderMessage('');
  expect(container.innerHTML).toBe('');
});

it('returns all messages when no namespace is specified', () => {
  function Component() {
    const t = useTranslations();
    return <>{t('generic.cancel')}</>;
  }

  render(
    <IntlProvider locale="en" messages={{generic: {cancel: 'Cancel'}}}>
      <Component />
    </IntlProvider>
  );

  screen.getByText('Cancel');
});

it('can access a nested namespace in the static call', () => {
  function Component() {
    const t = useTranslations('fancyComponents.FancyComponent');
    return <>{t('label')}</>;
  }

  render(
    <IntlProvider
      locale="en"
      messages={{fancyComponents: {FancyComponent: {label: 'Hello'}}}}
    >
      <Component />
    </IntlProvider>
  );

  screen.getByText('Hello');
});

it('switches the message when a new locale is provided', () => {
  function Component() {
    const t = useTranslations();
    return <>{t('label')}</>;
  }

  const {rerender} = render(
    <IntlProvider locale="en" messages={{label: 'Hello'}}>
      <Component />
    </IntlProvider>
  );
  screen.getByText('Hello');

  rerender(
    <IntlProvider locale="de" messages={{label: 'Hallo'}}>
      <Component />
    </IntlProvider>
  );
  screen.getByText('Hallo');
});

it('has a stable reference', () => {
  let existingT: any;

  function Component({count}: {count: number}) {
    const t = useTranslations();

    if (existingT) {
      expect(t).toBe(existingT);
    } else {
      // eslint-disable-next-line react-compiler/react-compiler
      existingT = t;
    }

    return <>{count}</>;
  }

  const messages = {};

  const {rerender} = render(
    <IntlProvider locale="en" messages={messages}>
      <Component count={1} />
    </IntlProvider>
  );
  screen.getByText('1');

  rerender(
    <IntlProvider locale="en" messages={messages}>
      <Component count={2} />
    </IntlProvider>
  );
  screen.getByText('2');
});

it('renders the correct message when the namespace changes', () => {
  function Component({namespace}: {namespace: string}): JSX.Element {
    const t = useTranslations(namespace);

    return <span>{t('title')}</span>;
  }

  const messages = {
    namespaceA: {title: 'This is namespace A'},
    namespaceB: {title: 'This is namespace B'}
  };

  const {rerender} = render(
    <IntlProvider locale="en" messages={messages}>
      <Component namespace="namespaceA" />
    </IntlProvider>
  );

  screen.getByText('This is namespace A');

  rerender(
    <IntlProvider locale="en" messages={messages}>
      <Component namespace="namespaceB" />
    </IntlProvider>
  );

  screen.getByText('This is namespace B');
});

it('utilizes a cache for parsing messages', () => {
  function getTree(renderNum: number) {
    return (
      <IntlProvider
        locale="en"
        messages={{message: '[Cache test] Render #{renderNum}'}}
      >
        <Component renderNum={renderNum} />
      </IntlProvider>
    );
  }

  function Component({renderNum}: {renderNum: number}) {
    const t = useTranslations();
    return <>{t('message', {renderNum})}</>;
  }

  const result = render(getTree(1));
  screen.getByText('[Cache test] Render #1');
  result.rerender(getTree(2));
  screen.getByText('[Cache test] Render #2');
  result.rerender(getTree(3));
  screen.getByText('[Cache test] Render #3');

  // The tree was rendered 3 times, but the message was parsed only once.
  expect(
    (IntlMessageFormat as any).invocationsByMessage[
      '[Cache test] Render #{renderNum}'
    ]
  ).toEqual(1);
});

it('updates translations when the messages on the provider change', () => {
  function Component() {
    const t = useTranslations();
    return <>{t('message')}</>;
  }

  const {rerender} = render(
    <IntlProvider locale="en" messages={{message: 'One'}}>
      <Component />
    </IntlProvider>
  );
  screen.getByText('One');

  rerender(
    <IntlProvider locale="en" messages={{message: 'Two'}}>
      <Component />
    </IntlProvider>
  );
  screen.getByText('Two');
});

describe('t.rich', () => {
  function renderRichTextMessage(
    message: string,
    values?: RichTranslationValues,
    formats?: Formats
  ) {
    function Component() {
      const t = useTranslations();
      return <>{t.rich('message', values, formats)}</>;
    }

    return render(
      <IntlProvider
        formats={{dateTime: {time: {hour: 'numeric', minute: '2-digit'}}}}
        locale="en"
        messages={{message}}
        timeZone="Europe/London"
      >
        <Component />
      </IntlProvider>
    );
  }

  it('handles rich text', () => {
    const {container} = renderRichTextMessage(
      'This is <important>important</important> and <important>this as well</important>',
      {
        important: (children) => <b>{children}</b>
      }
    );
    expect(container.innerHTML).toBe(
      'This is <b>important</b> and <b>this as well</b>'
    );
  });

  it('handles nested rich text', () => {
    const {container} = renderRichTextMessage(
      'This is <bold><italic>very</italic> important</bold>',
      {
        bold: (children) => <b>{children}</b>,
        italic: (children) => <i>{children}</i>
      }
    );
    expect(container.innerHTML).toBe('This is <b><i>very</i> important</b>');
  });

  it('supports identical wrappers with identical text content', () => {
    const consoleError = vi.spyOn(console, 'error');
    const {container} = renderRichTextMessage(
      '<b>foo</b> bar <b>foo</b> <i>foo</i> bar <i>foo</i> <b><i>foobar</i></b>',
      {
        b: (children) => <b>{children}</b>,
        i: (children) => <i>{children}</i>
      }
    );
    expect(container.innerHTML).toBe(
      '<b>foo</b> bar <b>foo</b> <i>foo</i> bar <i>foo</i> <b><i>foobar</i></b>'
    );
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe('t.markup', () => {
  it('returns markup text', () => {
    let result;

    function Component() {
      const t = useTranslations();
      // eslint-disable-next-line react-compiler/react-compiler
      result = t.markup('message', {
        important: (children) => `<b>${children}</b>`
      });
      return null;
    }

    render(
      <IntlProvider
        locale="en"
        messages={{
          message:
            'This is <important>important</important> and <important>this as well</important>'
        }}
        timeZone="Europe/London"
      >
        <Component />
      </IntlProvider>
    );

    expect(result).toBe('This is <b>important</b> and <b>this as well</b>');
  });
});

describe('t.raw', () => {
  function renderRawMessage(
    message: any,
    callback: (rendered: string) => ReactNode
  ) {
    function Component() {
      const t = useTranslations();
      return <>{callback(t.raw('message'))}</>;
    }

    return render(
      <IntlProvider locale="en" messages={{message}}>
        <Component />
      </IntlProvider>
    );
  }

  it('can return raw messages without processing them', () => {
    const {container} = renderRawMessage(
      '<a href="/test">Test</a><p>{hello}</p>',
      (message) => <span dangerouslySetInnerHTML={{__html: message}} />
    );

    expect(container.innerHTML).toBe(
      '<span><a href="/test">Test</a><p>{hello}</p></span>'
    );
  });

  it('can return objects', () => {
    const {container} = renderRawMessage(
      {nested: {object: true}},
      (message) => <span>{JSON.stringify(message)}</span>
    );
    expect(container.innerHTML).toBe('<span>{"nested":{"object":true}}</span>');
  });

  it('can return arrays', () => {
    const {container} = renderRawMessage(
      {array: [1, '2', {three: true}]},
      (message) => <span>{JSON.stringify(message)}</span>
    );
    expect(container.innerHTML).toBe(
      '<span>{"array":[1,"2",{"three":true}]}</span>'
    );
  });

  it('renders a fallback for unknown messages', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations();
      return <>{t.raw('foo')}</>;
    }

    render(
      <IntlProvider locale="en" messages={{bar: 'bar'}} onError={onError}>
        <Component />
      </IntlProvider>
    );

    expect(onError).toHaveBeenCalled();
    screen.getByText('foo');
  });
});

describe('t.has', () => {
  function wrapper({children}: PropsWithChildren) {
    return (
      <IntlProvider locale="en" messages={{foo: 'foo'}}>
        {children}
      </IntlProvider>
    );
  }

  it('returns true for existing messages', () => {
    const {result: t} = renderHook(() => useTranslations(), {wrapper});
    expect(t.current.has('foo')).toBe(true);
  });

  it('returns true for an empty message', () => {
    const {result: t} = renderHook(() => useTranslations(), {
      wrapper({children}: PropsWithChildren) {
        return (
          <IntlProvider locale="en" messages={{foo: ''}}>
            {children}
          </IntlProvider>
        );
      }
    });
    expect(t.current.has('foo')).toBe(true);
  });

  it('returns false for missing messages', () => {
    const {result: t} = renderHook(() => useTranslations(), {wrapper});
    expect(t.current.has('bar')).toBe(false);
  });

  it('returns false when no messages are provided', () => {
    const {result: t} = renderHook(() => useTranslations(), {
      wrapper({children}: PropsWithChildren) {
        return <IntlProvider locale="en">{children}</IntlProvider>;
      }
    });
    expect(t.current.has('foo')).toBe(false);
  });
});

describe('error handling', () => {
  it('allows to configure a fallback', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations('Component');
      return <>{t('label')}</>;
    }

    render(
      <IntlProvider
        getMessageFallback={() => 'fallback'}
        locale="en"
        messages={{}}
        onError={onError}
      >
        <Component />
      </IntlProvider>
    );

    expect(onError).toHaveBeenCalled();
    screen.getByText('fallback');
  });

  it('handles unavailable namespaces', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations('Component');
      return <>{t('label')}</>;
    }

    render(
      <IntlProvider locale="en" messages={{}} onError={onError}>
        <Component />
      </IntlProvider>
    );

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe(
      'MISSING_MESSAGE: Could not resolve `Component` in messages for locale `en`.'
    );
    expect(error.code).toBe(IntlErrorCode.MISSING_MESSAGE);
    screen.getByText('Component.label');
  });

  it('handles unavailable messages within an existing namespace', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations('Component');
      return <>{t('label')}</>;
    }

    render(
      <IntlProvider locale="en" messages={{Component: {}}} onError={onError}>
        <Component />
      </IntlProvider>
    );

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe(
      'MISSING_MESSAGE: Could not resolve `Component.label` in messages for locale `en`.'
    );
    expect(error.code).toBe(IntlErrorCode.MISSING_MESSAGE);
    screen.getByText('Component.label');
  });

  it('handles unparseable messages', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations();
      return <>{t('price', {value: 10})}</>;
    }

    render(
      <IntlProvider
        locale="en"
        messages={{price: '{value, currency}'}}
        onError={onError}
      >
        <Component />
      </IntlProvider>
    );

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe(
      'INVALID_MESSAGE: INVALID_ARGUMENT_TYPE ({value, currency})'
    );
    expect(error.code).toBe(IntlErrorCode.INVALID_MESSAGE);
    screen.getByText('price');
  });

  it('handles formatting errors', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations();
      return <>{t('price')}</>;
    }

    render(
      <IntlProvider locale="en" messages={{price: '{value}'}} onError={onError}>
        <Component />
      </IntlProvider>
    );

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe(
      'FORMATTING_ERROR: The intl string context variable "value" was not provided to the string "{value}"'
    );
    expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);
    screen.getByText('price');
  });

  it('handles rich text being returned from the regular translation function', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations();
      // @ts-expect-error Invalid usage
      return <>{t('rich', {p: (children) => <p>{children}</p>})}</>;
    }

    render(
      <IntlProvider
        locale="en"
        messages={{rich: '<p>Test</p>'}}
        onError={onError}
      >
        <Component />
      </IntlProvider>
    );

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe(
      "INVALID_MESSAGE: The message `rich` in messages didn't resolve to a string. If you want to format rich text, use `t.rich` instead."
    );
    expect(error.code).toBe(IntlErrorCode.INVALID_MESSAGE);
    screen.getByText('rich');
  });

  it('allows null values for messages', () => {
    const onError = vi.fn();

    render(
      <IntlProvider
        locale="en"
        // @ts-expect-error The types don't allow this,
        // but this shouldn't lead to an error.
        messages={{a: null}}
        onError={onError}
      >
        <span />
      </IntlProvider>
    );

    expect(onError).not.toHaveBeenCalled();
  });

  it('can render without messages', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations('Component');
      return <>{t('test')}</>;
    }

    render(
      <IntlProvider locale="en" onError={onError}>
        <Component />
      </IntlProvider>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    const error: IntlError = onError.mock.calls[0][0];
    expect(error.code).toBe(IntlErrorCode.MISSING_MESSAGE);
    expect(error.message).toBe(
      'MISSING_MESSAGE: No messages were configured on the provider.'
    );
    screen.getByText('Component.test');
  });

  it('warns for invalid namespace keys', () => {
    const onError = vi.fn();

    function Component() {
      return (
        <>
          <p>{useTranslations('a.b')('c.d')}</p>
          <p>{useTranslations('a.b')('e')}</p>
          <p>{useTranslations('f')('g.h.j')}</p>
          <p>{useTranslations('f.g')('h.j')}</p>
          <p>{useTranslations('f.g.h')('j')}</p>
          <p>{useTranslations()('f.g.h.j')}</p>
        </>
      );
    }

    const {container} = render(
      <IntlProvider
        locale="en"
        messages={{'a.b': {'c.d': 'ABCD', e: 'E'}, f: {g: {'h.j': 'FGHJ'}}}}
        onError={onError}
      >
        <Component />
      </IntlProvider>
    );

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.code).toBe(IntlErrorCode.INVALID_KEY);
    expect(error.message.split('\n').slice(0, 3).join('\n')).toBe(
      'INVALID_KEY: Namespace keys can not contain the character "." as this is used to express nesting. Please remove it or replace it with another character.\n\nInvalid keys: a.b, c.d (at a.b), h.j (at f.g)'
    );

    expect(container.innerHTML).toBe(
      '<p>a.b.c.d</p><p>a.b.e</p><p>f.g.h.j</p><p>f.g.h.j</p><p>f.g.h.j</p><p>f.g.h.j</p>'
    );
  });

  it('shows an error when trying to render an object with `t`', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations('Component');
      return <>{t('object')}</>;
    }

    render(
      <IntlProvider
        locale="en"
        messages={{Component: {object: {a: 'a'}}}}
        onError={onError}
      >
        <Component />
      </IntlProvider>
    );

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.code).toBe(IntlErrorCode.INSUFFICIENT_PATH);
    expect(error.message).toBe(
      'INSUFFICIENT_PATH: Message at `Component.object` resolved to an object, but only strings are supported. Use a `.` to retrieve nested messages. See https://next-intl-docs.vercel.app/docs/usage/messages#structuring-messages'
    );
  });

  it('shows an error when trying to render an object with `t.rich`', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations('Component');
      return <>{t.rich('object')}</>;
    }

    render(
      <IntlProvider
        locale="en"
        messages={{Component: {object: {a: 'a'}}}}
        onError={onError}
      >
        <Component />
      </IntlProvider>
    );

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.code).toBe(IntlErrorCode.INSUFFICIENT_PATH);
    expect(error.message).toBe(
      'INSUFFICIENT_PATH: Message at `Component.object` resolved to an object, but only strings are supported. Use a `.` to retrieve nested messages. See https://next-intl-docs.vercel.app/docs/usage/messages#structuring-messages'
    );
  });

  it('shows an error when trying to render an array with `t`', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations('Component');
      return <>{t('array')}</>;
    }

    render(
      <IntlProvider
        locale="en"
        // @ts-expect-error Arrays are not allowed
        messages={{Component: {array: ['a', 'b']}}}
        onError={onError}
      >
        <Component />
      </IntlProvider>
    );

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.code).toBe(IntlErrorCode.INVALID_MESSAGE);
    expect(error.message).toBe(
      'INVALID_MESSAGE: Message at `Component.array` resolved to an array, but only strings are supported. See https://next-intl-docs.vercel.app/docs/usage/messages#arrays-of-messages'
    );
  });

  it('shows an error when trying to render an array with `t.rich`', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslations('Component');
      return <>{t.rich('array')}</>;
    }

    render(
      <IntlProvider
        locale="en"
        // @ts-expect-error Arrays are not allowed
        messages={{Component: {array: ['a', 'b']}}}
        onError={onError}
      >
        <Component />
      </IntlProvider>
    );

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.code).toBe(IntlErrorCode.INVALID_MESSAGE);
    expect(error.message).toBe(
      'INVALID_MESSAGE: Message at `Component.array` resolved to an array, but only strings are supported. See https://next-intl-docs.vercel.app/docs/usage/messages#arrays-of-messages'
    );
  });
});

describe('global formats', () => {
  function renderDate(
    message: string,
    globalFormats?: Formats,
    overrideFormats?: Formats
  ) {
    function Component() {
      const t = useTranslations();
      const date = parseISO('2020-11-19T15:38:43.700Z');
      return <>{t('date', {value: date}, overrideFormats)}</>;
    }

    render(
      <IntlProvider
        formats={globalFormats}
        locale="en"
        messages={{date: message}}
      >
        <Component />
      </IntlProvider>
    );
  }

  it('allows to add global formats', () => {
    renderDate('{value, date, onlyYear}', {
      dateTime: {
        onlyYear: {
          year: 'numeric'
        }
      }
    });
    screen.getByText('2020');
  });

  it('can modify existing global formats', () => {
    renderDate('{value, date, full}', {
      dateTime: {
        full: {
          weekday: undefined
        }
      }
    });
    screen.getByText('November 19, 2020');
  });

  it('allows to override global formats locally', () => {
    renderDate(
      '{value, date, full}',
      {
        dateTime: {
          full: {
            weekday: undefined
          }
        }
      },
      {
        dateTime: {
          full: {
            weekday: 'long'
          }
        }
      }
    );
    screen.getByText('Thursday, November 19, 2020');
  });
});

describe('default translation values', () => {
  function renderRichTextMessageWithDefault(
    message: string,
    values?: RichTranslationValues,
    formats?: Formats
  ) {
    function Component() {
      const t = useTranslations();
      return <>{t.rich('message', values, formats)}</>;
    }

    return render(
      <IntlProvider
        defaultTranslationValues={{
          important: (children) => <b>{children}</b>
        }}
        formats={{dateTime: {time: {hour: 'numeric', minute: '2-digit'}}}}
        locale="en"
        messages={{message}}
        timeZone="Europe/London"
      >
        <Component />
      </IntlProvider>
    );
  }

  function renderMessageWithDefault(
    message: string,
    values?: TranslationValues,
    formats?: Formats
  ) {
    function Component() {
      const t = useTranslations();
      return <>{t('message', values, formats)}</>;
    }

    return render(
      <IntlProvider
        defaultTranslationValues={{
          value: 123
        }}
        formats={{dateTime: {time: {hour: 'numeric', minute: '2-digit'}}}}
        locale="en"
        messages={{message}}
        timeZone="Europe/London"
      >
        <Component />
      </IntlProvider>
    );
  }

  it('uses default rich text element', () => {
    const {container} = renderRichTextMessageWithDefault(
      'This is <important>important</important> and <important>this as well</important>'
    );
    expect(container.innerHTML).toBe(
      'This is <b>important</b> and <b>this as well</b>'
    );
  });

  it('overrides default rich text element', () => {
    const {container} = renderRichTextMessageWithDefault(
      'This is <important>important</important> and <important>this as well</important>',
      {
        important: (children) => <i>{children}</i>
      }
    );
    expect(container.innerHTML).toBe(
      'This is <i>important</i> and <i>this as well</i>'
    );
  });

  it('uses default translation values', () => {
    renderMessageWithDefault('Hello {value}');
    screen.getByText('Hello 123');
  });

  it('overrides default translation values', () => {
    renderMessageWithDefault('Hello {value}', {value: 234});
    screen.getByText('Hello 234');
  });
});

describe('performance', () => {
  const MockIntlMessageFormat: typeof IntlMessageFormat & {
    invocationsByMessage: Record<string, number>;
  } = IntlMessageFormat as any;

  beforeEach(() => {
    vi.mock('intl-messageformat', async (original) => {
      const ActualIntlMessageFormat: typeof IntlMessageFormat = (
        (await original()) as any
      ).IntlMessageFormat;

      return {
        IntlMessageFormat: class MockIntlMessageFormatImpl extends ActualIntlMessageFormat {
          public static invocationsByMessage: Record<string, number> = {};

          constructor(
            ...[message, ...rest]: ConstructorParameters<
              typeof IntlMessageFormat
            >
          ) {
            if (typeof message !== 'string') {
              throw new Error('Unsupported invocation for testing.');
            }

            super(message, ...rest);

            MockIntlMessageFormatImpl.invocationsByMessage[message] ||= 0;
            MockIntlMessageFormatImpl.invocationsByMessage[message]++;
          }
        }
      };
    });
  });

  it('caches message formats for component instances', () => {
    let renderCount = 0;

    function Component() {
      const t = useTranslations();
      renderCount++;
      return <>{t.rich('message', {count: renderCount})}</>;
    }

    function Provider({children}: {children: ReactNode}) {
      return (
        <IntlProvider locale="en" messages={{message: 'Hello #{count}'}}>
          {children}
        </IntlProvider>
      );
    }

    const {rerender} = render(
      <Provider>
        <Component />
      </Provider>
    );
    expect(MockIntlMessageFormat.invocationsByMessage['Hello #{count}']).toBe(
      1
    );
    expect(renderCount).toBe(1);
    screen.getByText('Hello #1');

    rerender(
      <Provider>
        <Component />
      </Provider>
    );
    expect(MockIntlMessageFormat.invocationsByMessage['Hello #{count}']).toBe(
      1
    );
    expect(renderCount).toBe(2);
    screen.getByText('Hello #2');
  });

  it("doesn't create a message format for plain strings", () => {
    let renderCount = 0;

    function Component() {
      const t = useTranslations();
      renderCount++;
      return <>{t('message')}</>;
    }

    function Provider({children}: {children: ReactNode}) {
      return (
        <IntlProvider locale="en" messages={{message: 'Hello'}}>
          {children}
        </IntlProvider>
      );
    }

    render(
      <Provider>
        <Component />
      </Provider>
    );
    expect(MockIntlMessageFormat.invocationsByMessage.Hello).toBe(undefined);
    expect(renderCount).toBe(1);
    screen.getByText('Hello');
  });

  it('reuses message formats across component instances', () => {
    function Component({value}: {value: number}) {
      const t = useTranslations();
      return <>{t('message', {value})}</>;
    }

    render(
      <IntlProvider locale="en" messages={{message: 'Value {value}'}}>
        <Component value={1} />
        <Component value={2} />
        <Component value={3} />
      </IntlProvider>
    );

    screen.getByText(['Value 1', 'Value 2', 'Value 3'].join(''));
    expect(MockIntlMessageFormat.invocationsByMessage['Value {value}']).toBe(1);
  });
});
