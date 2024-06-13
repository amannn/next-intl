import {expect, it, vi} from 'vitest';
import NextIntlClientProviderServer from '../../src/react-server/NextIntlClientProviderServer';
import {getLocale, getNow, getTimeZone} from '../../src/server.react-server';
import NextIntlClientProvider from '../../src/shared/NextIntlClientProvider';

vi.mock('../../src/runtimes/react-server.shared-runtime', async () => ({
  getLocale: vi.fn(async () => 'en-US'),
  getNow: vi.fn(async () => new Date('2020-01-01T00:00:00.000Z')),
  getTimeZone: vi.fn(async () => 'America/New_York')
}));

vi.mock('../../src/shared/NextIntlClientProvider', async () => ({
  default: vi.fn(() => 'NextIntlClientProvider')
}));

it("doesn't read from headers if all relevant configuration is passed", async () => {
  const result = await NextIntlClientProviderServer({
    children: null,
    locale: 'en-GB',
    now: new Date('2020-02-01T00:00:00.000Z'),
    timeZone: 'Europe/London'
  });

  expect(result.type).toBe(NextIntlClientProvider);
  expect(result.props).toEqual({
    children: null,
    locale: 'en-GB',
    now: new Date('2020-02-01T00:00:00.000Z'),
    timeZone: 'Europe/London'
  });

  expect(getLocale).not.toHaveBeenCalled();
  expect(getNow).not.toHaveBeenCalled();
  expect(getTimeZone).not.toHaveBeenCalled();
});

it('reads missing configuration from getter functions', async () => {
  const result = await NextIntlClientProviderServer({
    children: null
  });

  expect(result.type).toBe(NextIntlClientProvider);
  expect(result.props).toEqual({
    children: null,
    locale: 'en-US',
    now: new Date('2020-01-01T00:00:00.000Z'),
    timeZone: 'America/New_York'
  });

  expect(getLocale).toHaveBeenCalled();
  expect(getNow).toHaveBeenCalled();
  expect(getTimeZone).toHaveBeenCalled();
});
