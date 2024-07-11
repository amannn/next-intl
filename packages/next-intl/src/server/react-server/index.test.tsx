// @vitest-environment edge-runtime

import {it, vi, expect, describe} from 'vitest';
import {HEADER_LOCALE_NAME} from '../../shared/constants';
import {
  getTranslations,
  getMessages,
  getFormatter,
  getNow,
  getTimeZone
} from '.';

vi.mock('next-intl/config', () => ({
  default: async () =>
    (
      (await vi.importActual('../../../src/server/react-server')) as any
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

vi.mock('react');

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function TypeTests() {
    const t = await getTranslations();

    // Valid
    t('About.basic');

    // @ts-expect-error Invalid argument
    t(2);
  }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function TypeTests() {
    const format = await getFormatter();
    const date = new Date('2020-01-01T00:00:00.000Z');

    // Valid
    format.dateTime(date, {dateStyle: 'full'});

    // @ts-expect-error Invalid argument
    format.dateTime(date, {dateStyle: 'unknown'});
  }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function TypeTests() {
    const now = await getNow();

    // Valid
    now.toISOString();

    // @ts-expect-error Invalid argument
    now.unknown();
  }
});

describe('getMessages', () => {
  it('works with an implicit locale', async () => {
    expect(await getMessages()).toHaveProperty('About');
  });

  it('returns the messages', async () => {
    expect(await getMessages({locale: 'en'})).toHaveProperty('About');
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function TypeTests() {
    const messages = await getMessages();

    // @ts-expect-error
    messages.about();

    // Valid
    return messages.about;
  }
});

describe('getTimeZone', () => {
  it('works with an implicit locale', async () => {
    expect(await getTimeZone()).toBe('Europe/London');
  });

  it('returns the time zone', async () => {
    expect(await getTimeZone({locale: 'en'})).toBe('Europe/London');
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function TypeTests() {
    const timeZone = await getTimeZone();

    // Valid
    timeZone.toUpperCase();

    // @ts-expect-error Invalid argument
    timeZone.unknown();
  }
});
