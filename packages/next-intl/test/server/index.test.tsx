// @vitest-environment edge-runtime

import {it, vi, expect, describe} from 'vitest';
import {
  getTranslations,
  getMessages,
  getFormatter,
  getNow,
  getTimeZone
} from '../../src/server';
import {HEADER_LOCALE_NAME} from '../../src/shared/constants';

vi.mock('next-intl/config', () => ({
  default: async () =>
    (
      (await vi.importActual('../../src/server')) as any
    ).getRequestConfig({
      locale: 'en',
      now: new Date('2020-01-01T00:00:00.000Z'),
      timeZone: 'Europe/London',
      messages: {
        About: {
          basic: 'Hello',
          interpolation: 'Hello {name}',
          rich: '<link>{name}</link>'
        }
      }
    })
}));

vi.mock('next/headers', () => ({
  headers: () => ({
    get(name: string) {
      if (name === HEADER_LOCALE_NAME) {
        return 'en';
      } else {
        throw new Error('Unknown header: ' + name);
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

describe('getTranslations', () => {
  it('works with an implicit locale', async () => {
    const t = await getTranslations('About');
    expect(t('basic')).toBe('Hello');
  });

  it('works without a namespace', async () => {
    const t = await getTranslations();
    expect(t('About.basic')).toBe('Hello');
  });

  it('can interpolate variables', async () => {
    const t = await getTranslations({locale: 'en', namespace: 'About'});
    expect(t('interpolation', {name: 'Jane'})).toBe('Hello Jane');
  });

  it('renders rich text to a string', async () => {
    const t = await getTranslations({locale: 'en', namespace: 'About'});
    expect(
      t.rich('rich', {
        name: 'Example',
        link: (chunks) => `<a href="https://example.com">${chunks}</a>`
      })
    ).toBe('<a href="https://example.com">Example</a>');
  });

  it('renders raw text to a string', async () => {
    const t = await getTranslations({locale: 'en', namespace: 'About'});
    expect(t.raw('rich')).toBe('<link>{name}</link>');
  });
});

describe('getFormatter', () => {
  it('works with an implicit locale', async () => {
    const format = await getFormatter();
    expect(format.dateTime(new Date('2020-01-01T00:00:00.000Z'))).toBe(
      '1/1/2020'
    );
  });

  it('can format a date', async () => {
    const format = await getFormatter({locale: 'en'});
    expect(format.dateTime(new Date('2020-01-01T00:00:00.000Z'))).toBe(
      '1/1/2020'
    );
  });
});

describe('getNow', () => {
  it('works with an implicit locale', async () => {
    expect((await getNow()).toISOString()).toBe('2020-01-01T00:00:00.000Z');
  });

  it('returns the current time', async () => {
    expect((await getNow({locale: 'en'})).toISOString()).toBe(
      '2020-01-01T00:00:00.000Z'
    );
  });
});

describe('getMessages', () => {
  it('works with an implicit locale', async () => {
    expect(await getMessages()).toHaveProperty('About');
  });

  it('returns the messages', async () => {
    expect(await getMessages({locale: 'en'})).toHaveProperty('About');
  });
});

describe('getTimeZone', () => {
  it('works with an implicit locale', async () => {
    expect(await getTimeZone()).toBe('Europe/London');
  });

  it('returns the time zone', async () => {
    expect(await getTimeZone({locale: 'en'})).toBe('Europe/London');
  });
});
