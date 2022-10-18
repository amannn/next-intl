import React from 'react';
import {createTranslator, IntlError, IntlErrorCode} from '../../src';

(global as any).__DEV__ = true;

const messages = {
  Home: {
    title: 'Hello world!',
    rich: '<b>Hello <i>{name}</i>!</b>'
  }
};

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
  const onError = jest.fn();

  const t = createTranslator({
    locale: 'en',
    messages: {price: '{value}'},
    onError
  });

  const result = t('price');

  const error: IntlError = onError.mock.calls[0][0];
  expect(error.message).toBe(
    'FORMATTING_ERROR: The intl string context variable "value" was not provided to the string "{value}"'
  );
  expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);

  expect(result).toBe('price');
});

describe('t.rich', () => {
  it('can translate a message', () => {
    const t = createTranslator({
      locale: 'en',
      namespace: 'Home',
      messages
    });

    expect(
      t.rich('rich', {
        name: 'world',
        b: (chunks) => `<b>${chunks}</b>`,
        i: (chunks) => `<i>${chunks}</i>`
      })
    ).toBe('<b>Hello <i>world</i>!</b>');
  });

  it('handles errors when React components are provided', () => {
    const onError = jest.fn();
    const t = createTranslator({
      locale: 'en',
      namespace: 'Home',
      messages,
      onError
    });

    const result = t.rich('rich', {
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
      "FORMATTING_ERROR: `createTranslator` only accepts functions for rich text formatting that receive and return strings.\n\nE.g. t.rich('rich', {b: (chunks) => `<b>${chunks}</b>`})"
    );
    expect(result).toBe('Home.rich');
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
