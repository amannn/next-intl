import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import getConfigNow from '../server/react-server/getConfigNow.js';
import getFormats from '../server/react-server/getFormats.js';
import {getLocale, getMessages, getTimeZone} from '../server.react-server.js';
import NextIntlClientProvider from '../shared/NextIntlClientProvider.js';
import {loadTreeShakingManifest} from '../tree-shaking/inferMessages.js';
import {getTreeShakingLazyOnlyEnvKey} from '../tree-shaking/mode.js';
import NextIntlClientProviderServer from './NextIntlClientProviderServer.js';

vi.mock('../../src/server/react-server', async () => ({
  getLocale: vi.fn(async () => 'en-US'),
  getMessages: vi.fn(async () => ({})),
  getTimeZone: vi.fn(async () => 'America/New_York')
}));

vi.mock('../../src/server/react-server/getFormats', () => ({
  default: vi.fn(async () => ({
    dateTime: {
      short: {
        day: 'numeric'
      }
    }
  }))
}));

vi.mock('../../src/server/react-server/getConfigNow', () => ({
  default: vi.fn(async () => new Date('2020-01-01T00:00:00.000Z'))
}));

vi.mock('../../src/shared/NextIntlClientProvider', async () => ({
  default: vi.fn(() => 'NextIntlClientProvider')
}));

vi.mock('../../src/tree-shaking/inferMessages', async () => {
  const actual = await vi.importActual('../../src/tree-shaking/inferMessages');
  return {
    ...actual,
    loadTreeShakingManifest: vi.fn(async () => undefined)
  };
});

const lazyOnlyEnvKey = getTreeShakingLazyOnlyEnvKey();
const originalLazyOnlyEnv = process.env[lazyOnlyEnvKey];

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env[lazyOnlyEnvKey];
  vi.mocked(getLocale).mockResolvedValue('en-US');
  vi.mocked(getMessages).mockResolvedValue({});
  vi.mocked(getTimeZone).mockResolvedValue('America/New_York');
  vi.mocked(loadTreeShakingManifest).mockResolvedValue(undefined);
});

afterEach(() => {
  if (originalLazyOnlyEnv === undefined) {
    delete process.env[lazyOnlyEnvKey];
  } else {
    process.env[lazyOnlyEnvKey] = originalLazyOnlyEnv;
  }
});

function readProviderFromResult(
  result: Awaited<ReturnType<typeof NextIntlClientProviderServer>>
) {
  if (result.type === NextIntlClientProvider) {
    return result;
  }

  const children = Array.isArray(result.props.children)
    ? result.props.children
    : [result.props.children];
  return children[1];
}

it("doesn't read from headers if all relevant configuration is passed", async () => {
  const result = await NextIntlClientProviderServer({
    children: null,
    locale: 'en-GB',
    now: new Date('2020-02-01T00:00:00.000Z'),
    timeZone: 'Europe/London',
    formats: {},
    messages: {}
  });

  expect(result.type).toBe(NextIntlClientProvider);
  expect(result.props).toEqual({
    children: null,
    locale: 'en-GB',
    now: new Date('2020-02-01T00:00:00.000Z'),
    timeZone: 'Europe/London',
    formats: {},
    messages: {}
  });

  expect(getLocale).not.toHaveBeenCalled();
  expect(getConfigNow).not.toHaveBeenCalled();
  expect(getTimeZone).not.toHaveBeenCalled();
  expect(getFormats).not.toHaveBeenCalled();
  expect(getMessages).not.toHaveBeenCalled();
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
    timeZone: 'America/New_York',
    messages: {},
    formats: {
      dateTime: {
        short: {
          day: 'numeric'
        }
      }
    }
  });

  expect(getLocale).toHaveBeenCalled();
  expect(getConfigNow).toHaveBeenCalled();
  expect(getTimeZone).toHaveBeenCalled();
  expect(getFormats).toHaveBeenCalled();
  expect(getMessages).toHaveBeenCalled();
});

it('resolves inferred messages from an injected layout segment', async () => {
  vi.mocked(getMessages).mockResolvedValue({
    Feed: 'Feed message',
    Root: 'Root message'
  });
  vi.mocked(loadTreeShakingManifest).mockResolvedValue({
    '/': {
      hasLayoutProvider: true,
      namespaces: {
        Root: true
      }
    },
    '/feed': {
      hasLayoutProvider: true,
      namespaces: {
        Feed: true
      }
    }
  });

  const result = await NextIntlClientProviderServer({
    __layoutSegment: '/feed',
    children: null,
    messages: 'infer'
  });

  const provider = readProviderFromResult(result);
  expect(provider.type).toBe(NextIntlClientProvider);
  expect(provider.props.messages).toEqual({Feed: 'Feed message'});
});

it('prefers injected segment namespaces over global manifest loading', async () => {
  vi.mocked(getMessages).mockResolvedValue({
    Feed: 'Feed message',
    Root: 'Root message'
  });

  const result = await NextIntlClientProviderServer({
    __inferredMessagesManifest: {
      Feed: true
    },
    __layoutSegment: '/feed',
    children: null,
    messages: 'infer'
  });

  const provider = readProviderFromResult(result);
  expect(provider.type).toBe(NextIntlClientProvider);
  expect(provider.props.messages).toEqual({Feed: 'Feed message'});
  expect(loadTreeShakingManifest).not.toHaveBeenCalled();
});

it('skips global manifest fallback when lazy-only mode is enabled', async () => {
  process.env[lazyOnlyEnvKey] = '1';
  vi.mocked(getMessages).mockResolvedValue({
    Feed: 'Feed message',
    Root: 'Root message'
  });

  const result = await NextIntlClientProviderServer({
    __layoutSegment: '/feed',
    children: null,
    messages: 'infer'
  });

  const provider = readProviderFromResult(result);
  expect(provider.type).toBe(NextIntlClientProvider);
  expect(provider.props.messages).toEqual({
    Feed: 'Feed message',
    Root: 'Root message'
  });
  expect(loadTreeShakingManifest).not.toHaveBeenCalled();
});
