import {render, screen} from '@testing-library/react';
import {parseISO} from 'date-fns';
import React, {ReactNode} from 'react';
import {
  Formats,
  IntlError,
  IntlErrorCode,
  IntlProvider,
  RichTranslationValues,
  TranslationValues,
  useTranslations
} from '../src';

(global as any).__DEV__ = true;

function renderMessage(
  message: string,
  values?: TranslationValues,
  formats?: Partial<Formats>
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
      timeZone="Europe/London"
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

it('handles number formatting with percent', () => {
  renderMessage('{value, number, percent}', {value: 0.312});
  screen.getByText('31%');
});

it('handles number formatting with a static currency', () => {
  renderMessage('{price, number, ::currency/EUR}', {price: 123394.1243});
  screen.getByText('€123,394.12');
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
  screen.getByText('3:38 PM');
});

it('handles pluralisation', () => {
  renderMessage(
    'You have {numMessages, plural, =0 {no messages} =1 {one message} other {# messages}}.',
    {numMessages: 1}
  );
  screen.getByText('You have one message.');
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
    {year: 1}
  );
  screen.getByText("It's my cat's 1st birthday!");
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

describe('t.rich', () => {
  function renderRichTextMessage(
    message: string,
    values?: RichTranslationValues,
    formats?: Partial<Formats>
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
        important: (children: ReactNode) => <b>{children}</b>
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
        bold: (children: ReactNode) => <b>{children}</b>,
        italic: (children: ReactNode) => <i>{children}</i>
      }
    );
    expect(container.innerHTML).toBe('This is <b><i>very</i> important</b>');
  });
});

describe('t.raw', () => {
  function renderRawMessage(
    message: any,
    callback: (message: string) => ReactNode
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
    const {
      container
    } = renderRawMessage(
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

  it('renders a fallback for unknown messages', () => {
    const onError = jest.fn();

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

describe('error handling', () => {
  it('allows to configure a fallback', () => {
    const onError = jest.fn();

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
    const onError = jest.fn();

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
      'MISSING_MESSAGE: Could not resolve `Component` in messages.'
    );
    expect(error.code).toBe(IntlErrorCode.MISSING_MESSAGE);
    screen.getByText('Component.label');
  });

  it('handles unavailable messages within an existing namespace', () => {
    const onError = jest.fn();

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
      'MISSING_MESSAGE: Could not resolve `label` in `Component`.'
    );
    expect(error.code).toBe(IntlErrorCode.MISSING_MESSAGE);
    screen.getByText('Component.label');
  });

  it('handles unparseable messages', () => {
    const onError = jest.fn();

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
      'INVALID_MESSAGE: Expected "date", "number", "plural", "select", "selectordinal", or "time" but "c" found.'
    );
    expect(error.code).toBe(IntlErrorCode.INVALID_MESSAGE);
    screen.getByText('price');
  });

  it('handles formatting errors', () => {
    const onError = jest.fn();

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
    const onError = jest.fn();

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
});

describe('global formats', () => {
  function renderDate(
    message: string,
    globalFormats?: Partial<Formats>,
    overrideFormats?: Partial<Formats>
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
