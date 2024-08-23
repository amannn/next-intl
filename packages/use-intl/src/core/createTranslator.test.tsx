import React, {isValidElement} from 'react';
import {renderToString} from 'react-dom/server';
import {it, expect, describe, vi} from 'vitest';
import IntlError, {IntlErrorCode} from './IntlError';
import createTranslator from './createTranslator';

const messages = {
  Home: {
    title: 'Hello world!',
    rich: '<b>Hello <i>{name}</i>!</b>',
    markup: '<b>Hello <i>{name}</i>!</b>'
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
  const onError = vi.fn();

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
