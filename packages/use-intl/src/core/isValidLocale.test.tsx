import {describe, expect, it} from 'vitest';
import isValidLocale from './isValidLocale.tsx';

it('narrows down the type', () => {
  const locales = ['en-US', 'en-GB'] as const;
  const candidate = 'en-US' as string;
  if (isValidLocale(locales, candidate)) {
    candidate satisfies (typeof locales)[number];
  }
});

describe('accepts valid formats', () => {
  it.each([
    'en',
    'en-US',
    'EN-US',
    'en-us',
    'en-GB',
    'zh-Hans-CN',
    'es-419',
    'en-Latn',
    'zh-Hans',
    'en-US-u-ca-buddhist',
    'en-x-private1',
    'en-US-u-nu-thai',
    'ar-u-nu-arab',
    'en-t-m0-true',
    'zh-Hans-CN-x-private1-private2',
    'en-US-u-ca-gregory-nu-latn',
    'en-US-x-usd',

    // Somehow tolerated by Intl.Locale
    'english'
  ])('accepts: %s', (locale) => {
    expect(isValidLocale([locale] as const, locale)).toBe(true);
  });
});

describe('rejects invalid formats', () => {
  it.each([
    'en_US',
    'en-',
    'e-US',
    'en-USA',
    'und',
    '123',
    '-en',
    'en--US',
    'toolongstring',
    'en-US-',
    '@#$',
    'en US',
    'en.US'
  ])('rejects: %s', (locale) => {
    expect(() => isValidLocale([locale] as const, locale)).toThrow();
  });
});
