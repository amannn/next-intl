import {permanentRedirect as nextPermanentRedirect} from 'next/navigation';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import basePermanentRedirect from '../../../src/navigation/shared/basePermanentRedirect';

vi.mock('next/navigation');

beforeEach(() => {
  vi.clearAllMocks();
});

describe("localePrefix: 'always'", () => {
  describe('basePermanentRedirect', () => {
    it('handles internal paths', () => {
      basePermanentRedirect({
        pathname: '/test/path',
        locale: 'en',
        localePrefix: 'always'
      });
      expect(nextPermanentRedirect).toHaveBeenCalledTimes(1);
      expect(nextPermanentRedirect).toHaveBeenCalledWith('/en/test/path');
    });

    it('handles external paths', () => {
      basePermanentRedirect({
        pathname: 'https://example.com',
        locale: 'en',
        localePrefix: 'always'
      });
      expect(nextPermanentRedirect).toHaveBeenCalledTimes(1);
      expect(nextPermanentRedirect).toHaveBeenCalledWith('https://example.com');
    });
  });
});

describe("localePrefix: 'as-needed'", () => {
  describe('basePermanentRedirect', () => {
    it('handles internal paths', () => {
      basePermanentRedirect({
        pathname: '/test/path',
        locale: 'en',
        localePrefix: 'as-needed'
      });
      expect(nextPermanentRedirect).toHaveBeenCalledTimes(1);
      expect(nextPermanentRedirect).toHaveBeenCalledWith('/en/test/path');
    });

    it('handles external paths', () => {
      basePermanentRedirect({
        pathname: 'https://example.com',
        locale: 'en',
        localePrefix: 'as-needed'
      });
      expect(nextPermanentRedirect).toHaveBeenCalledTimes(1);
      expect(nextPermanentRedirect).toHaveBeenCalledWith('https://example.com');
    });
  });
});

describe("localePrefix: 'never'", () => {
  describe('basePermanentRedirect', () => {
    it('handles internal paths', () => {
      basePermanentRedirect({
        pathname: '/test/path',
        locale: 'en',
        localePrefix: 'never'
      });
      expect(nextPermanentRedirect).toHaveBeenCalledTimes(1);
      expect(nextPermanentRedirect).toHaveBeenCalledWith('/test/path');
    });

    it('handles external paths', () => {
      basePermanentRedirect({
        pathname: 'https://example.com',
        locale: 'en',
        localePrefix: 'never'
      });
      expect(nextPermanentRedirect).toHaveBeenCalledTimes(1);
      expect(nextPermanentRedirect).toHaveBeenCalledWith('https://example.com');
    });
  });
});
