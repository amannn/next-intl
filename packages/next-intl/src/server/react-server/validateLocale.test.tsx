import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import validateLocale from './validateLocale.js';

describe('accepts valid formats', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

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
    validateLocale(locale);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});

describe('warns for invalid formats', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

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
    validateLocale(locale);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
