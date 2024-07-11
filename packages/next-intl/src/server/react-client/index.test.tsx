import {describe, expect, it} from 'vitest';
import {getRequestConfig} from '../../server.react-client';

describe('getRequestConfig', () => {
  it('can be called in the outer module closure', () => {
    expect(
      getRequestConfig(({locale}) => ({
        messages: {hello: 'Hello ' + locale}
      }))
    );
  });

  it('can not call the returned function', () => {
    const getConfig = getRequestConfig(({locale}) => ({
      messages: {hello: 'Hello ' + locale}
    }));
    expect(() => getConfig({locale: 'en'})).toThrow(
      '`getRequestConfig` is not supported in Client Components.'
    );
  });
});
