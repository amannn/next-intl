import {render, screen} from '@testing-library/react';
import React, {ReactNode} from 'react';
import {
  NextIntlProvider,
  useTranslations,
  NextIntlMessages,
  TranslationValues
} from '../src';

(global as any).__DEV__ = true;

jest.mock('next/router', () => ({
  useRouter: () => ({locale: 'en'})
}));

const messages: NextIntlMessages = {
  Component: {
    static: 'Hello',
    interpolation: 'Hello {name}',
    number: '{price, number, ::currency/EUR}',
    date: '{now, date, medium}',
    plural:
      'You have {numMessages, plural, =0 {no messages} =1 {one message} other {# messages}}.',
    select: '{gender, select, male {He} female {She} other {They}} is online.',
    selectordinal:
      "It's my cat's {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",
    richText: 'This is <important>important</important>',
    attributeUrl: 'https://example.com',
    nested: {
      label: 'Nested'
    }
  },
  generic: {
    cancel: 'Cancel'
  },
  fancyComponents: {
    FancyComponent: {
      hello: 'Hello'
    }
  }
};

function Provider({children}: {children: ReactNode}) {
  return <NextIntlProvider messages={messages}>{children}</NextIntlProvider>;
}

function renderMessage(message: string, values?: TranslationValues) {
  function Component() {
    const t = useTranslations('Component');
    return <>{t(message, values)}</>;
  }

  return render(
    <Provider>
      <Component />
    </Provider>
  );
}

it('handles static messages', () => {
  renderMessage('static');
  screen.getByText('Hello');
});

it('handles basic interpolation', () => {
  renderMessage('interpolation', {name: 'Jane'});
  screen.getByText('Hello Jane');
});

it('handles number formatting', () => {
  renderMessage('number', {price: 123394.1243});
  screen.getByText('€123,394.12');
});

it('handles date formatting', () => {
  renderMessage('date', {now: new Date('2020-11-19T15:38:43.700Z')});
  screen.getByText('Nov 19, 2020');
});

it('handles pluralisation', () => {
  renderMessage('plural', {numMessages: 1});
  screen.getByText('You have one message.');
});

it('handles selects', () => {
  renderMessage('select', {gender: 'female'});
  screen.getByText('She is online.');
});

it('handles selectordinals', () => {
  renderMessage('selectordinal', {year: 1});
  screen.getByText("It's my cat's 1st birthday!");
});

it('handles rich text', () => {
  const {container} = renderMessage('richText', {
    important: (children: ReactNode) => <b key="important">{children}</b>
  });
  expect(container.innerHTML).toBe('This is <b>important</b>');
});

it('can use messages in attributes', () => {
  function Component() {
    const t = useTranslations('Component');
    return <a href={String(t('attributeUrl'))}>{t('static')}</a>;
  }

  const {container} = render(
    <Provider>
      <Component />
    </Provider>
  );

  expect(container.innerHTML).toBe('<a href="https://example.com">Hello</a>');
});

it('can resolve nested paths', () => {
  const {container} = renderMessage('nested.label');
  expect(container.innerHTML).toBe('Nested');
});

it('returns all messages when no namespace is specified', () => {
  function Component() {
    const t = useTranslations();
    return <>{t('generic.cancel')}</>;
  }

  render(
    <Provider>
      <Component />
    </Provider>
  );

  screen.getByText('Cancel');
});

it('can access a nested namespace in the static call', () => {
  function Component() {
    const t = useTranslations('fancyComponents.FancyComponent');
    return <>{t('hello')}</>;
  }

  render(
    <Provider>
      <Component />
    </Provider>
  );

  screen.getByText('Hello');
});
