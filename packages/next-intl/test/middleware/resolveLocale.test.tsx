import {describe, expect, it} from 'vitest';
import {getAcceptLanguageLocale} from '../../src/middleware/resolveLocale';

describe('getAcceptLanguageLocale', () => {
  it('resolves a more specific locale to a generic one', () => {
    const requestHeaders = new Headers({
      'accept-language': 'en-US;q=0.9,de;q=0.7'
    });
    const locales = ['en', 'de'];
    const defaultLocale = 'de';
    expect(
      getAcceptLanguageLocale(requestHeaders, locales, defaultLocale)
    ).toBe('en');
  });

  it('resolves a more generic locale to a specific one', () => {
    const requestHeaders = new Headers({
      'accept-language': 'en-GB;q=0.9'
    });
    const locales = ['en-US', 'de-DE'];
    const defaultLocale = 'de-DE';
    expect(
      getAcceptLanguageLocale(requestHeaders, locales, defaultLocale)
    ).toBe('en-US');
  });

  it('resolves the most specific locale', () => {
    const requestHeaders = new Headers({
      'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8'
    });
    const locales = ['en', 'de', 'de-DE'];
    const defaultLocale = 'de';
    expect(
      getAcceptLanguageLocale(requestHeaders, locales, defaultLocale)
    ).toBe('de-DE');
  });

  it('ignores private tags in available locales', () => {
    // https://tc39.es/ecma402/#sec-language-tags
    const requestHeaders = new Headers({
      'accept-language': 'en;q=0.9,de;q=0.7'
    });
    const locales = ['en-x-p1', 'de-x-p2'];
    const defaultLocale = 'en-x-p1';
    expect(
      getAcceptLanguageLocale(requestHeaders, locales, defaultLocale)
    ).toBe('en-x-p1');
  });
});
