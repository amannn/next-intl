// sd@vitest-environment edge-runtime

import {it, vi, expect, describe} from 'vitest';
import {
  getTranslator,
  getMessages,
  getFormatter,
  getNow,
  getTimeZone
} from '../../src/server';

vi.mock('next-intl/config', () => ({
  default: () => ({
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
    const t = await getTranslator('en', 'About');
    expect(t('interpolation', {name: 'Jane'})).toBe('Hello Jane');
  });

  it('renders rich text to a string', async () => {
    const t = await getTranslator('en', 'About');
    expect(
      t.rich('rich', {
        name: 'Example',
        link: (chunks) => `<a href="https://example.com">${chunks}</a>`
      })
    ).toBe('<a href="https://example.com">Example</a>');
  });

  it('renders raw text to a string', async () => {
    const t = await getTranslator('en', 'About');
    expect(t.raw('rich')).toBe('<link>{name}</link>');
  });
});

describe('getFormatter', () => {
  it('can format a date', async () => {
    const format = await getFormatter('en');
    expect(format.dateTime(new Date('2020-01-01T00:00:00.000Z'))).toBe(
      '1/1/2020'
    );
  });
});

describe('getNow', () => {
  it('returns the current time', async () => {
    expect((await getNow('en')).toISOString()).toBe('2020-01-01T00:00:00.000Z');
  });
});

describe('getMessages', () => {
  it('returns the messages', async () => {
    expect(await getMessages('en')).toHaveProperty('About');
  });
});

describe('getTimeZone', () => {
  it('returns the time zone', async () => {
    expect(await getTimeZone('en')).toBe('Europe/London');
  });
});
