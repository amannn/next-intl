import {describe, it} from 'vitest';
import defineRouting from './defineRouting';

describe('defaultLocale', () => {
  it('ensures the `defaultLocale` is within `locales`', () => {
    defineRouting({
      locales: ['en'],
      // @ts-expect-error
      defaultLocale: 'es'
    });

    defineRouting({
      locales: ['en', 'de'],
      defaultLocale: 'en'
    });
  });
});

describe('pathnames', () => {
  it('accepts a `pathnames` config', () => {
    const routing = defineRouting({
      locales: ['en', 'de'],
      defaultLocale: 'en',
      pathnames: {
        '/': '/',
        '/about': {
          en: '/about',
          de: '/ueber-uns'
        }
      }
    });

    // Ensures the result is typed as narrow as possible
    // eslint-disable-next-line no-unused-expressions
    routing.pathnames['/about'].en;
  });

  it('ensures all locales have a value', () => {
    defineRouting({
      locales: ['en', 'de'],
      defaultLocale: 'en',
      pathnames: {
        // @ts-expect-error -- Missing de
        '/about': {
          en: '/about'
        }
      }
    });
  });
});

describe('domains', () => {
  it('accepts a `domains` config', () => {
    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      domains: [
        {
          defaultLocale: 'en',
          domain: 'example.com'
        }
      ]
    });
  });

  it('ensures `defaultLocale` is within `locales`', () => {
    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      domains: [
        {
          // @ts-expect-error
          defaultLocale: 'es',
          domain: 'example.com'
        }
      ]
    });
  });

  it('ensures `locales` are within `locales`', () => {
    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      domains: [
        {
          defaultLocale: 'en',
          domain: 'example.com',
          locales: ['en']
        }
      ]
    });

    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      domains: [
        {
          defaultLocale: 'en',
          domain: 'example.com',
          // @ts-expect-error
          locales: ['es']
        }
      ]
    });
  });
});

describe('localePrefix', () => {
  it('accepts a shorthand `localePrefix`', () => {
    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      localePrefix: 'always'
    });

    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      localePrefix: 'never'
    });
  });

  it('accepts a verbose `localePrefix`', () => {
    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      localePrefix: {
        mode: 'always'
      }
    });

    defineRouting({
      locales: ['en-GB', 'en-US'],
      defaultLocale: 'en-US',
      localePrefix: {
        mode: 'as-needed'
      }
    });
  });

  describe('custom prefixes', () => {
    it('accepts partial prefixes', () => {
      defineRouting({
        locales: ['en-GB', 'en-US'],
        defaultLocale: 'en-US',
        localePrefix: {
          mode: 'as-needed',
          prefixes: {
            'en-US': '/us'
            // (en-GB is used as-is)
          }
        }
      });
    });

    it('ensures locales used in prefixes are valid', () => {
      defineRouting({
        locales: ['en'],
        defaultLocale: 'en',
        localePrefix: {
          mode: 'as-needed',
          prefixes: {
            // @ts-expect-error
            'en-ES': '/es'
          }
        }
      });
    });
  });
});
