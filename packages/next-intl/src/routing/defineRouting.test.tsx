import {beforeEach, describe, expect, it, vi} from 'vitest';
import defineRouting from './defineRouting.js';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    routing.pathnames['/about'].en;
  });

  it('accepts a partial config for only some locales', () => {
    defineRouting({
      locales: ['en', 'de'],
      defaultLocale: 'en',
      pathnames: {
        '/about': {
          de: '/ueber-uns'
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
          domain: 'example.com',
          locales: ['en']
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
          domain: 'example.com',
          locales: ['en']
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

  describe('validation', () => {
    beforeEach(() => {
      const originalConsoleWarn = console.warn;
      console.warn = vi.fn();
      return () => {
        console.warn = originalConsoleWarn;
      };
    });

    it('does not warn if locales are unique per domain', () => {
      defineRouting({
        locales: ['en-US', 'en-CA', 'fr-CA', 'fr-FR'],
        defaultLocale: 'en-US',
        domains: [
          {
            domain: 'us.example.com',
            defaultLocale: 'en-US',
            locales: ['en-US']
          },
          {
            domain: 'ca.example.com',
            defaultLocale: 'en-CA',
            locales: ['en-CA', 'fr-CA']
          },
          {
            domain: 'fr.example.com',
            defaultLocale: 'fr-FR',
            locales: ['fr-FR']
          }
        ]
      });

      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should warn if locales are not unique per domain', () => {
      defineRouting({
        locales: ['en', 'fr'],
        defaultLocale: 'en',
        domains: [
          {
            domain: 'us.example.com',
            defaultLocale: 'en',
            locales: ['en']
          },
          {
            domain: 'ca.example.com',
            defaultLocale: 'en',
            locales: ['en', 'fr']
          },
          {
            domain: 'fr.example.com',
            defaultLocale: 'fr',
            locales: ['fr']
          }
        ]
      });

      expect(console.warn).toHaveBeenCalledWith(
        'Locales are expected to be unique per domain, but found overlap:\n' +
          '- "en" is used by: us.example.com, ca.example.com\n' +
          '- "fr" is used by: ca.example.com, fr.example.com\n' +
          'Please see https://next-intl.dev/docs/routing#domains'
      );
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

describe('localeCookie', () => {
  it('can set it to `false`', () => {
    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      localeCookie: false
    });
  });

  it('accepts a custom config', () => {
    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      localeCookie: {
        name: 'custom',
        domain: 'example.com',
        maxAge: 60 * 60 * 24 * 365,
        partitioned: true,
        path: '/',
        priority: 'high',
        sameSite: 'strict',
        secure: true
      }
    });
  });

  it('restricts the available attributes', () => {
    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      localeCookie: {
        // @ts-expect-error
        httpOnly: true
      }
    });

    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      localeCookie: {
        // @ts-expect-error
        value: 'custom'
      }
    });

    defineRouting({
      locales: ['en'],
      defaultLocale: 'en',
      localeCookie: {
        // @ts-expect-error
        expires: 123
      }
    });
  });
});
