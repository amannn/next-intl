/* eslint-disable @typescript-eslint/no-unused-vars */
import {describe, it} from 'vitest';
import type {DomainConfig, LocalePrefix} from './types.js';

describe('LocalePrefix', () => {
  it('does not require a type param for simple values', () => {
    const config: LocalePrefix = 'always';
  });

  it('provides strict typing for locales', () => {
    const locales = ['en', 'de'] as const;
    const config: LocalePrefix<typeof locales> = {
      mode: 'always',
      prefixes: {
        en: '/en',
        // @ts-expect-error
        unknown: '/unknown'
      }
    };
  });

  it('allows partial config', () => {
    const locales = ['en', 'de'] as const;
    const config: LocalePrefix<typeof locales> = {
      mode: 'always',
      prefixes: {
        en: '/en'
      }
    };
  });

  it('provides optional typing for locales in prefixes', () => {
    const config: LocalePrefix = {
      mode: 'always',
      prefixes: {
        de: '/de',
        en: '/en',
        unknown: '/unknown'
      }
    };
  });
});

describe('DomainConfig', () => {
  it('allows to handle all locales', () => {
    const config: DomainConfig<['en', 'de']> = {
      defaultLocale: 'en',
      domain: 'example.com'
    };
  });

  it('allows to restrict locales', () => {
    const config: DomainConfig<['en', 'de']> = {
      defaultLocale: 'en',
      domain: 'example.com',
      locales: ['en']
    };
  });

  it('errors for unknown locales', () => {
    const config: DomainConfig<['en', 'de']> = {
      // @ts-expect-error
      defaultLocale: 'unknown',
      domain: 'example.com',
      // @ts-expect-error
      locales: ['unknown']
    };
  });
});
