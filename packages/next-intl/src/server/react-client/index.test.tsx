import {describe, expect, it} from 'vitest';
import {getRequestConfig} from '../../server.react-client.tsx';

describe('getRequestConfig', () => {
  it('can be called in the outer module closure', () => {
    expect(
      getRequestConfig(async ({requestLocale}) => ({
        messages: {hello: 'Hello ' + (await requestLocale)}
      }))
    );
  });

  it('can not call the returned function', () => {
    const getConfig = getRequestConfig(async ({requestLocale}) => ({
      messages: {hello: 'Hello ' + (await requestLocale)}
    }));
    expect(() => getConfig({requestLocale: Promise.resolve('en')})).toThrow(
      '`getRequestConfig` is not supported in Client Components.'
    );
  });
});
