/* eslint-disable @typescript-eslint/no-unused-vars */
import {it} from 'vitest';
import {LocalePrefixConfig} from '../../src/routing/types';

it('does not require a type param for simple values', () => {
  const config: LocalePrefixConfig = 'always';
});

it('provides strict typing for locales', () => {
  const locales = ['en', 'de'] as const;
  const config: LocalePrefixConfig<typeof locales> = {
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
  const config: LocalePrefixConfig<typeof locales> = {
    mode: 'always',
    prefixes: {
      en: '/en'
    }
  };
});

it('provides optional typing for locales in prefixes', () => {
  const config: LocalePrefixConfig = {
    mode: 'always',
    prefixes: {
      de: '/de',
      en: '/en',
      unknown: '/unknown'
    }
  };
});
