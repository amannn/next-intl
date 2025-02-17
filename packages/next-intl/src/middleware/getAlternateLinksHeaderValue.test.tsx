// @vitest-environment edge-runtime

import {NextRequest} from 'next/server.js';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {receiveRoutingConfig} from '../routing/config.js';
import type {Pathnames} from '../routing.js';
import getAlternateLinksHeaderValue from './getAlternateLinksHeaderValue.js';

describe.each([{basePath: undefined}, {basePath: '/base'}])(
  'basePath: $basePath',
  ({basePath = ''}: {basePath?: string}) => {
    function getMockRequest(
      href: string,
      init?: ConstructorParameters<typeof NextRequest>[1]
    ) {
      const url = new URL(href);
      if (basePath) {
        url.pathname = basePath + url.pathname;
        if (url.pathname.endsWith('/')) {
          url.pathname = url.pathname.slice(0, -1);
        }
      }

      return new NextRequest(url, {
        ...init,
        headers: init?.headers,
        nextConfig: {basePath: basePath || undefined}
      });
    }

    it('works for prefixed routing (as-needed)', () => {
      const routing = receiveRoutingConfig({
        defaultLocale: 'en',
        locales: ['en', 'es'],
        localePrefix: 'as-needed'
      });

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/'),
          resolvedLocale: 'en'
        }).split(', ')
      ).toEqual([
        `<https://example.com${
          basePath || '/'
        }>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/es>; rel="alternate"; hreflang="es"`,
        `<https://example.com${
          basePath || '/'
        }>; rel="alternate"; hreflang="x-default"`
      ]);

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/about'),
          resolvedLocale: 'en'
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/es/about>; rel="alternate"; hreflang="es"`,
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="x-default"`
      ]);

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/energy/es'),
          resolvedLocale: 'en'
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/energy/es>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/es/energy/es>; rel="alternate"; hreflang="es"`,
        `<https://example.com${basePath}/energy/es>; rel="alternate"; hreflang="x-default"`
      ]);
    });

    it('works for prefixed routing (as-needed) with `pathnames`', () => {
      const routing = receiveRoutingConfig({
        defaultLocale: 'en',
        locales: ['en', 'de'],
        localePrefix: 'as-needed'
      });
      const pathnames = {
        '/': '/',
        '/about': {
          en: '/about',
          de: '/ueber'
        },
        '/users': {
          en: '/users',
          de: '/benutzer'
        },
        '/users/[userId]': {
          en: '/users/[userId]',
          de: '/benutzer/[userId]'
        }
      };

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/'),
          resolvedLocale: 'en',
          localizedPathnames: pathnames['/']
        }).split(', ')
      ).toEqual([
        `<https://example.com${
          basePath || '/'
        }>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/de>; rel="alternate"; hreflang="de"`,
        `<https://example.com${
          basePath || '/'
        }>; rel="alternate"; hreflang="x-default"`
      ]);

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/about'),
          resolvedLocale: 'en',
          localizedPathnames: pathnames['/about']
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/de/ueber>; rel="alternate"; hreflang="de"`,
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="x-default"`
      ]);

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/de/ueber'),
          resolvedLocale: 'de',
          localizedPathnames: pathnames['/about']
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/de/ueber>; rel="alternate"; hreflang="de"`,
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="x-default"`
      ]);

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/users/2'),
          resolvedLocale: 'en',
          localizedPathnames: pathnames['/users/[userId]']
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/users/2>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/de/benutzer/2>; rel="alternate"; hreflang="de"`,
        `<https://example.com${basePath}/users/2>; rel="alternate"; hreflang="x-default"`
      ]);
    });

    it('works for prefixed routing (always)', () => {
      const routing = receiveRoutingConfig({
        defaultLocale: 'en',
        locales: ['en', 'es'],
        localePrefix: 'always'
      });

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/'),
          resolvedLocale: 'en'
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/en>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/es>; rel="alternate"; hreflang="es"`,
        `<https://example.com${
          basePath || '/'
        }>; rel="alternate"; hreflang="x-default"`
      ]);

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/about'),
          resolvedLocale: 'en'
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/en/about>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/es/about>; rel="alternate"; hreflang="es"`,
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="x-default"`
      ]);
    });

    it("works for type domain with `localePrefix: 'as-needed'`", () => {
      const routing = receiveRoutingConfig({
        defaultLocale: 'en',
        locales: ['en', 'es', 'fr'],
        localePrefix: 'as-needed',
        domains: [
          {
            domain: 'example.com',
            defaultLocale: 'en'
            // (supports all locales)
          },
          {
            domain: 'example.es',
            defaultLocale: 'es',
            locales: ['es']
          },
          {
            domain: 'example.ca',
            defaultLocale: 'en',
            locales: ['en', 'fr']
          }
        ]
      });

      [
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/'),
          resolvedLocale: 'en'
        }).split(', '),
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.es'),
          resolvedLocale: 'es'
        }).split(', ')
      ].forEach((links) => {
        expect(links).toEqual([
          `<https://example.com${
            basePath || '/'
          }>; rel="alternate"; hreflang="en"`,
          `<https://example.ca${
            basePath || '/'
          }>; rel="alternate"; hreflang="en"`,
          `<https://example.com${basePath}/es>; rel="alternate"; hreflang="es"`,
          `<https://example.es${
            basePath || '/'
          }>; rel="alternate"; hreflang="es"`,
          `<https://example.com${basePath}/fr>; rel="alternate"; hreflang="fr"`,
          `<https://example.ca${basePath}/fr>; rel="alternate"; hreflang="fr"`
        ]);
      });

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/about'),
          resolvedLocale: 'en'
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="en"`,
        `<https://example.ca${basePath}/about>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/es/about>; rel="alternate"; hreflang="es"`,
        `<https://example.es${basePath}/about>; rel="alternate"; hreflang="es"`,
        `<https://example.com${basePath}/fr/about>; rel="alternate"; hreflang="fr"`,
        `<https://example.ca${basePath}/fr/about>; rel="alternate"; hreflang="fr"`
      ]);
    });

    it("works for type domain with `localePrefix: 'always'`", () => {
      const routing = receiveRoutingConfig({
        defaultLocale: 'en',
        locales: ['en', 'es', 'fr'],
        domains: [
          {
            domain: 'example.com',
            defaultLocale: 'en'
            // (supports all locales)
          },
          {
            domain: 'example.es',
            defaultLocale: 'es',
            locales: ['es']
          },
          {
            domain: 'example.ca',
            defaultLocale: 'en',
            locales: ['en', 'fr']
          }
        ]
      });

      [
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/'),
          resolvedLocale: 'en'
        }).split(', '),
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.es'),
          resolvedLocale: 'es'
        }).split(', ')
      ].forEach((links) => {
        expect(links).toEqual([
          `<https://example.com${basePath}/en>; rel="alternate"; hreflang="en"`,
          `<https://example.ca${basePath}/en>; rel="alternate"; hreflang="en"`,
          `<https://example.com${basePath}/es>; rel="alternate"; hreflang="es"`,
          `<https://example.es${basePath}/es>; rel="alternate"; hreflang="es"`,
          `<https://example.com${basePath}/fr>; rel="alternate"; hreflang="fr"`,
          `<https://example.ca${basePath}/fr>; rel="alternate"; hreflang="fr"`
        ]);
      });

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://example.com/about'),
          resolvedLocale: 'en'
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/en/about>; rel="alternate"; hreflang="en"`,
        `<https://example.ca${basePath}/en/about>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/es/about>; rel="alternate"; hreflang="es"`,
        `<https://example.es${basePath}/es/about>; rel="alternate"; hreflang="es"`,
        `<https://example.com${basePath}/fr/about>; rel="alternate"; hreflang="fr"`,
        `<https://example.ca${basePath}/fr/about>; rel="alternate"; hreflang="fr"`
      ]);
    });

    it("works for type domain with `localePrefix: 'as-needed' with `pathnames``", () => {
      const routing = receiveRoutingConfig({
        localePrefix: 'as-needed',
        defaultLocale: 'en',
        locales: ['en', 'fr'],
        domains: [
          {defaultLocale: 'en', domain: 'en.example.com', locales: ['en']},
          {
            defaultLocale: 'en',
            domain: 'ca.example.com',
            locales: ['en', 'fr']
          },
          {defaultLocale: 'fr', domain: 'fr.example.com', locales: ['fr']}
        ],
        pathnames: {
          '/': '/',
          '/about': {
            en: '/about',
            fr: '/a-propos'
          },
          '/users': {
            en: '/users',
            fr: '/utilisateurs'
          },
          '/users/[userId]': {
            en: '/users/[userId]',
            fr: '/utilisateurs/[userId]'
          },
          '/news/[articleSlug]-[articleId]': {
            en: '/news/[articleSlug]-[articleId]',
            fr: '/nouvelles/[articleSlug]-[articleId]'
          },
          '/products/[...slug]': {
            en: '/products/[...slug]',
            fr: '/produits/[...slug]'
          },
          '/categories/[[...slug]]': {
            en: '/categories/[[...slug]]',
            fr: '/categories/[[...slug]]'
          }
        } satisfies Pathnames<ReadonlyArray<'en' | 'fr'>>
      });

      [
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://en.example.com/'),
          resolvedLocale: 'en'
        }),
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://ca.example.com'),
          resolvedLocale: 'en'
        }),
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://ca.example.com/fr'),
          resolvedLocale: 'fr'
        }),
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://fr.example.com'),
          resolvedLocale: 'fr'
        })
      ]
        .map((links) => links.split(', '))
        .forEach((links) => {
          expect(links).toEqual([
            `<https://en.example.com${
              basePath || '/'
            }>; rel="alternate"; hreflang="en"`,
            `<https://ca.example.com${
              basePath || '/'
            }>; rel="alternate"; hreflang="en"`,
            `<https://ca.example.com${basePath}/fr>; rel="alternate"; hreflang="fr"`,
            `<https://fr.example.com${
              basePath || '/'
            }>; rel="alternate"; hreflang="fr"`
          ]);
        });

      [
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://en.example.com/about'),
          resolvedLocale: 'en',
          localizedPathnames: routing.pathnames!['/about']
        }),
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://ca.example.com/about'),
          resolvedLocale: 'en',
          localizedPathnames: routing.pathnames!['/about']
        }),
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://ca.example.com/fr/a-propos'),
          resolvedLocale: 'fr',
          localizedPathnames: routing.pathnames!['/about']
        }),
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://fr.example.com/a-propos'),
          resolvedLocale: 'fr',
          localizedPathnames: routing.pathnames!['/about']
        })
      ]
        .map((links) => links.split(', '))
        .forEach((links) => {
          expect(links).toEqual([
            `<https://en.example.com${basePath}/about>; rel="alternate"; hreflang="en"`,
            `<https://ca.example.com${basePath}/about>; rel="alternate"; hreflang="en"`,
            `<https://ca.example.com${basePath}/fr/a-propos>; rel="alternate"; hreflang="fr"`,
            `<https://fr.example.com${basePath}/a-propos>; rel="alternate"; hreflang="fr"`
          ]);
        });

      [
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://en.example.com/users/42'),
          resolvedLocale: 'en',
          localizedPathnames: routing.pathnames!['/users/[userId]']
        }),
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://ca.example.com/users/42'),
          resolvedLocale: 'en',
          localizedPathnames: routing.pathnames!['/users/[userId]']
        }),
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://ca.example.com/fr/utilisateurs/42'),
          resolvedLocale: 'fr',
          localizedPathnames: routing.pathnames!['/users/[userId]']
        }),
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('https://fr.example.com/utilisateurs/42'),
          resolvedLocale: 'fr',
          localizedPathnames: routing.pathnames!['/users/[userId]']
        })
      ]
        .map((links) => links.split(', '))
        .forEach((links) => {
          expect(links).toEqual([
            `<https://en.example.com${basePath}/users/42>; rel="alternate"; hreflang="en"`,
            `<https://ca.example.com${basePath}/users/42>; rel="alternate"; hreflang="en"`,
            `<https://ca.example.com${basePath}/fr/utilisateurs/42>; rel="alternate"; hreflang="fr"`,
            `<https://fr.example.com${basePath}/utilisateurs/42>; rel="alternate"; hreflang="fr"`
          ]);
        });
    });

    it('uses the external host name from headers instead of the url of the incoming request (relevant when running the app behind a proxy)', () => {
      const routing = receiveRoutingConfig({
        defaultLocale: 'en',
        locales: ['en', 'es'],
        localePrefix: 'as-needed'
      });

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('http://127.0.0.1/about', {
            headers: {
              host: 'example.com',
              'x-forwarded-host': 'example.com',
              'x-forwarded-proto': 'https'
            }
          }),
          resolvedLocale: 'en'
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/es/about>; rel="alternate"; hreflang="es"`,
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="x-default"`
      ]);
    });

    it('keeps the port of an external host if provided', () => {
      const routing = receiveRoutingConfig({
        defaultLocale: 'en',
        locales: ['en', 'es'],
        localePrefix: 'as-needed'
      });

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('http://127.0.0.1/about', {
            headers: {
              host: 'example.com:3000',
              'x-forwarded-host': 'example.com:3000',
              'x-forwarded-proto': 'https'
            }
          }),
          resolvedLocale: 'en'
        }).split(', ')
      ).toEqual([
        `<https://example.com:3000${basePath}/about>; rel="alternate"; hreflang="en"`,
        `<https://example.com:3000${basePath}/es/about>; rel="alternate"; hreflang="es"`,
        `<https://example.com:3000${basePath}/about>; rel="alternate"; hreflang="x-default"`
      ]);
    });

    it('uses the external host name and the port from headers instead of the url with port of the incoming request (relevant when running the app behind a proxy)', () => {
      const routing = receiveRoutingConfig({
        defaultLocale: 'en',
        locales: ['en', 'es'],
        localePrefix: 'as-needed'
      });

      expect(
        getAlternateLinksHeaderValue({
          routing,
          request: getMockRequest('http://127.0.0.1:3000/about', {
            headers: {
              host: 'example.com',
              'x-forwarded-host': 'example.com',
              'x-forwarded-proto': 'https'
            }
          }),
          resolvedLocale: 'en'
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/es/about>; rel="alternate"; hreflang="es"`,
        `<https://example.com${basePath}/about>; rel="alternate"; hreflang="x-default"`
      ]);
    });
  }
);

describe('trailingSlash: true', () => {
  beforeEach(() => {
    process.env._next_intl_trailing_slash = 'true';
  });
  afterEach(() => {
    delete process.env._next_intl_trailing_slash;
  });

  it('adds a trailing slash to pathnames', () => {
    const routing = receiveRoutingConfig({
      defaultLocale: 'en',
      locales: ['en', 'es'],
      localePrefix: 'as-needed'
    });

    expect(
      getAlternateLinksHeaderValue({
        routing,
        request: new NextRequest(new URL('https://example.com/about')),
        resolvedLocale: 'en'
      }).split(', ')
    ).toEqual([
      `<https://example.com/about/>; rel="alternate"; hreflang="en"`,
      `<https://example.com/es/about/>; rel="alternate"; hreflang="es"`,
      `<https://example.com/about/>; rel="alternate"; hreflang="x-default"`
    ]);
  });

  describe('localized pathnames', () => {
    const routing = receiveRoutingConfig({
      defaultLocale: 'en',
      locales: ['en', 'es'],
      localePrefix: 'as-needed'
    });
    const pathnames = {
      '/': '/',
      '/about': {
        en: '/about',
        es: '/acerca'
      }
    };

    it('adds a trailing slash to nested pathnames when localized pathnames are used', () => {
      ['/about', '/about/'].forEach((pathname) => {
        expect(
          getAlternateLinksHeaderValue({
            routing,
            request: new NextRequest(new URL('https://example.com' + pathname)),
            resolvedLocale: 'en',
            localizedPathnames: pathnames['/about']
          }).split(', ')
        ).toEqual([
          `<https://example.com/about/>; rel="alternate"; hreflang="en"`,
          `<https://example.com/es/acerca/>; rel="alternate"; hreflang="es"`,
          `<https://example.com/about/>; rel="alternate"; hreflang="x-default"`
        ]);
      });
    });

    it('adds a trailing slash to the root pathname when localized pathnames are used', () => {
      ['', '/'].forEach((pathname) => {
        expect(
          getAlternateLinksHeaderValue({
            routing,
            request: new NextRequest(new URL('https://example.com' + pathname)),
            resolvedLocale: 'en',
            localizedPathnames: pathnames['/']
          }).split(', ')
        ).toEqual([
          `<https://example.com/>; rel="alternate"; hreflang="en"`,
          `<https://example.com/es/>; rel="alternate"; hreflang="es"`,
          `<https://example.com/>; rel="alternate"; hreflang="x-default"`
        ]);
      });
    });
  });
});
