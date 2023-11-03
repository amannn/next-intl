// @vitest-environment edge-runtime

import {it, vi, expect, describe} from 'vitest';
import {
  getTranslator,
  getMessages,
  getFormatter,
  getNow,
  getTimeZone
} from '../../src/server.react-server';

vi.mock('next-intl/config', () => ({
  default: async () =>
    (
      (await vi.importActual('../../src/server.react-server')) as any
    ).getRequestConfig({
      locale: 'en',
      now: new Date('2020-01-01T00:00:00.000Z'),
      timeZone: 'Europe/London',
      messages: {
        About: {
          interpolation: 'Hello {name}',
          rich: '<link>{name}</link>'
        }
      }
    })
}));

vi.mock('react', async (importOriginal) => {
  const React = (await importOriginal()) as typeof import('react');
  return {
    ...React,
    cache(fn: (...args: Array<unknown>) => unknown) {
      return (...args: Array<unknown>) => fn(...args);
    }
  };
});

describe('getTranslator', () => {
  it('can interpolate variables', async () => {
    const t = await getTranslator({locale: 'en', namespace: 'About'});
    expect(t('interpolation', {name: 'Jane'})).toBe('Hello Jane');
  });

  it('renders rich text to a string', async () => {
    const t = await getTranslator({locale: 'en', namespace: 'About'});
    expect(
      t.rich('rich', {
        name: 'Example',
        link: (chunks) => `<a href="https://example.com">${chunks}</a>`
      })
    ).toBe('<a href="https://example.com">Example</a>');
  });

  it('renders raw text to a string', async () => {
    const t = await getTranslator({locale: 'en', namespace: 'About'});
    expect(t.raw('rich')).toBe('<link>{name}</link>');
  });
});

describe('getFormatter', () => {
  it('can format a date', async () => {
    const format = await getFormatter({locale: 'en'});
    expect(format.dateTime(new Date('2020-01-01T00:00:00.000Z'))).toBe(
      '1/1/2020'
    );
  });
});

describe('getNow', () => {
  it('returns the current time', async () => {
    expect((await getNow({locale: 'en'})).toISOString()).toBe(
      '2020-01-01T00:00:00.000Z'
    );
  });
});

describe('getMessages', () => {
  it('returns the messages', async () => {
    expect(await getMessages({locale: 'en'})).toHaveProperty('About');
  });
});

describe('getTimeZone', () => {
  it('returns the time zone', async () => {
    expect(await getTimeZone({locale: 'en'})).toBe('Europe/London');
  });
});
