import {describe, expect, it} from 'vitest';
import {getRequestConfig} from '../../server.react-client.js';

describe('getRequestConfig', () => {
  it('can be called in the outer module closure', () => {
    expect(
      getRequestConfig(async ({requestLocale}) => ({
        locale: (await requestLocale) || 'en',
        messages: {hello: 'Hello'}
      }))
    );
  });

  it('can not call the returned function', () => {
    const getConfig = getRequestConfig(async ({requestLocale}) => ({
      locale: (await requestLocale) || 'en',
      messages: {hello: 'Hello '}
    }));
    expect(() => getConfig({requestLocale: Promise.resolve('en')})).toThrow(
      '`getRequestConfig` is not supported in Client Components.'
    );
  });
});
