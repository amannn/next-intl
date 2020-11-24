import {render, screen} from '@testing-library/react';
import React, {ReactNode} from 'react';
import {NextIntlProvider, useTranslations, TranslationValues} from '../src';

(global as any).__DEV__ = true;

jest.mock('next/router', () => ({
  useRouter: () => ({locale: 'en'})
}));

function renderMessage(message: string, values?: TranslationValues) {
  function Component() {
    const t = useTranslations();
    return <>{t('message', values)}</>;
  }

  return render(
    <NextIntlProvider messages={{message}}>
      <Component />
    </NextIntlProvider>
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

it('handles number formatting', () => {
  renderMessage('{price, number, ::currency/EUR}', {price: 123394.1243});
  screen.getByText('€123,394.12');
});

it('handles date formatting', () => {
  renderMessage('{now, date, medium}', {
    now: new Date('2020-11-19T15:38:43.700Z')
  });
  screen.getByText('Nov 19, 2020');
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

it('handles rich text', () => {
  const {container} = renderMessage(
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
  const {container} = renderMessage(
    'This is <bold><italic>very</italic> important</bold>',
    {
      bold: (children: ReactNode) => <b>{children}</b>,
      italic: (children: ReactNode) => <i>{children}</i>
    }
  );
  expect(container.innerHTML).toBe('This is <b><i>very</i> important</b>');
});

it('can use messages in attributes', () => {
  function Component() {
    const t = useTranslations();
    return <a href={String(t('message'))}>Hello</a>;
  }

  const {container} = render(
    <NextIntlProvider messages={{message: 'https://example.com'}}>
      <Component />
    </NextIntlProvider>
  );

  expect(container.innerHTML).toBe('<a href="https://example.com">Hello</a>');
});

it('can resolve nested paths', () => {
  function Component() {
    const t = useTranslations('nested');
    return <p>{t('moreNesting.label')}</p>;
  }

  render(
    <NextIntlProvider messages={{nested: {moreNesting: {label: 'Nested'}}}}>
      <Component />
    </NextIntlProvider>
  );

  screen.getByText('Nested');
});

it('returns all messages when no namespace is specified', () => {
  function Component() {
    const t = useTranslations();
    return <>{t('generic.cancel')}</>;
  }

  render(
    <NextIntlProvider messages={{generic: {cancel: 'Cancel'}}}>
      <Component />
    </NextIntlProvider>
  );

  screen.getByText('Cancel');
});

it('can access a nested namespace in the static call', () => {
  function Component() {
    const t = useTranslations('fancyComponents.FancyComponent');
    return <>{t('label')}</>;
  }

  render(
    <NextIntlProvider
      messages={{fancyComponents: {FancyComponent: {label: 'Hello'}}}}
    >
      <Component />
    </NextIntlProvider>
  );

  screen.getByText('Hello');
});
