import {
  permanentRedirect as nextPermanentRedirect,
  redirect as nextRedirect
} from 'next/navigation';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  baseRedirect,
  basePermanentRedirect
} from '../../../src/navigation/shared/redirects';

vi.mock('next/navigation');

beforeEach(() => {
  vi.clearAllMocks();
});

describe.each([
  [baseRedirect, nextRedirect],
  [basePermanentRedirect, nextPermanentRedirect]
])('baseRedirect', (redirectFn, nextFn) => {
  describe("localePrefix: 'always'", () => {
    it('handles internal paths', () => {
      redirectFn({
        pathname: '/test/path',
        locale: 'en',
        localePrefix: 'always'
      });
      expect(nextFn).toHaveBeenCalledTimes(1);
      expect(nextFn).toHaveBeenCalledWith('/en/test/path');
    });

    it('handles external paths', () => {
      redirectFn({
        pathname: 'https://example.com',
        locale: 'en',
        localePrefix: 'always'
      });
      expect(nextFn).toHaveBeenCalledTimes(1);
      expect(nextFn).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe("localePrefix: 'as-needed'", () => {
    it('handles internal paths', () => {
      redirectFn({
        pathname: '/test/path',
        locale: 'en',
        localePrefix: 'as-needed'
      });
      expect(nextFn).toHaveBeenCalledTimes(1);
      expect(nextFn).toHaveBeenCalledWith('/en/test/path');
    });

    it('handles external paths', () => {
      redirectFn({
        pathname: 'https://example.com',
        locale: 'en',
        localePrefix: 'as-needed'
      });
      expect(nextFn).toHaveBeenCalledTimes(1);
      expect(nextFn).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe("localePrefix: 'never'", () => {
    it('handles internal paths', () => {
      redirectFn({
        pathname: '/test/path',
        locale: 'en',
        localePrefix: 'never'
      });
      expect(nextFn).toHaveBeenCalledTimes(1);
      expect(nextFn).toHaveBeenCalledWith('/test/path');
    });

    it('handles external paths', () => {
      redirectFn({
        pathname: 'https://example.com',
        locale: 'en',
        localePrefix: 'never'
      });
      expect(nextFn).toHaveBeenCalledTimes(1);
      expect(nextFn).toHaveBeenCalledWith('https://example.com');
    });
  });
});
