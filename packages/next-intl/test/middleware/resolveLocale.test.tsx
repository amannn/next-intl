import {describe, expect, it} from 'vitest';
import {getAcceptLanguageLocale} from '../../src/middleware/resolveLocale';

describe('getAcceptLanguageLocale', () => {
  it('should resolve a more specific locale to a generic one', () => {
    const requestHeaders = new Headers({
      'accept-language': 'en-US;q=0.9,de;q=0.7'
    });
    const locales = ['en', 'de'];
    const defaultLocale = 'de';
    expect(
      getAcceptLanguageLocale(requestHeaders, locales, defaultLocale)
    ).toBe('en');
  });

  it('should resolve a more generic locale to a specific one', () => {
    const requestHeaders = new Headers({
      'accept-language': 'en;q=0.9,de;q=0.7'
    });
    const locales = ['en-US', 'de'];
    const defaultLocale = 'de';
    expect(
      getAcceptLanguageLocale(requestHeaders, locales, defaultLocale)
    ).toBe('en-US');
  });
});
