// @vitest-environment edge-runtime

import {NextRequest} from 'next/server';
import {it, expect, describe} from 'vitest';
import {MiddlewareConfigWithDefaults} from '../../src/middleware/NextIntlMiddlewareConfig';
import getAlternateLinksHeaderValue from '../../src/middleware/getAlternateLinksHeaderValue';
import {Pathnames} from '../../src/navigation/react-client';

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
      const config: MiddlewareConfigWithDefaults<['en', 'es']> = {
        defaultLocale: 'en',
        locales: ['en', 'es'],
        alternateLinks: true,
        localePrefix: {mode: 'as-needed'},
        localeDetection: true
      };

      expect(
        getAlternateLinksHeaderValue({
          config,
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
          config,
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
          config,
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
      const config: MiddlewareConfigWithDefaults<['en', 'de']> = {
        defaultLocale: 'en',
        locales: ['en', 'de'],
        alternateLinks: true,
        localePrefix: {mode: 'as-needed'},
        localeDetection: true
      };
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
          config,
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
          config,
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
          config,
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
          config,
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
      const config: MiddlewareConfigWithDefaults<['en', 'es']> = {
        defaultLocale: 'en',
        locales: ['en', 'es'],
        alternateLinks: true,
        localePrefix: {mode: 'always'},
        localeDetection: true
      };

      expect(
        getAlternateLinksHeaderValue({
          config,
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
          config,
          request: getMockRequest('https://example.com/about'),
          resolvedLocale: 'en'
        }).split(', ')
      ).toEqual([
        `<https://example.com${basePath}/en/about>; rel="alternate"; hreflang="en"`,
        `<https://example.com${basePath}/es/about>; rel="alternate"; hreflang="es"`
      ]);
    });

    it("works for type domain with `localePrefix: 'as-needed'`", () => {
      const config: MiddlewareConfigWithDefaults<['en', 'es', 'fr']> = {
        defaultLocale: 'en',
        locales: ['en', 'es', 'fr'],
        alternateLinks: true,
        localePrefix: {mode: 'as-needed'},
        localeDetection: true,
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
      };

      [
        getAlternateLinksHeaderValue({
          config,
          request: getMockRequest('https://example.com/'),
          resolvedLocale: 'en'
        }).split(', '),
        getAlternateLinksHeaderValue({
          config,
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
          config,
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
      const config: MiddlewareConfigWithDefaults<['en', 'es', 'fr']> = {
        defaultLocale: 'en',
        locales: ['en', 'es', 'fr'],
        alternateLinks: true,
        localePrefix: {mode: 'always'},
        localeDetection: true,
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
      };

      [
        getAlternateLinksHeaderValue({
          config,
          request: getMockRequest('https://example.com/'),
          resolvedLocale: 'en'
        }).split(', '),
        getAlternateLinksHeaderValue({
          config,
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
          config,
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
      const config: MiddlewareConfigWithDefaults<['en', 'fr']> = {
        alternateLinks: true,
        localePrefix: {mode: 'as-needed'},
        localeDetection: true,
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
      };

      [
        getAlternateLinksHeaderValue({
          config,
          request: getMockRequest('https://en.example.com/'),
          resolvedLocale: 'en'
        }),
        getAlternateLinksHeaderValue({
          config,
          request: getMockRequest('https://ca.example.com'),
          resolvedLocale: 'en'
        }),
        getAlternateLinksHeaderValue({
          config,
          request: getMockRequest('https://ca.example.com/fr'),
          resolvedLocale: 'fr'
        }),
        getAlternateLinksHeaderValue({
          config,
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
          config,
          request: getMockRequest('https://en.example.com/about'),
          resolvedLocale: 'en',
          localizedPathnames: config.pathnames!['/about']
        }),
        getAlternateLinksHeaderValue({
          config,
          request: getMockRequest('https://ca.example.com/about'),
          resolvedLocale: 'en',
          localizedPathnames: config.pathnames!['/about']
        }),
        getAlternateLinksHeaderValue({
          config,
          request: getMockRequest('https://ca.example.com/fr/a-propos'),
          resolvedLocale: 'fr',
          localizedPathnames: config.pathnames!['/about']
        }),
        getAlternateLinksHeaderValue({
          config,
          request: getMockRequest('https://fr.example.com/a-propos'),
          resolvedLocale: 'fr',
          localizedPathnames: config.pathnames!['/about']
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
          config,
          request: getMockRequest('https://en.example.com/users/42'),
          resolvedLocale: 'en',
          localizedPathnames: config.pathnames!['/users/[userId]']
        }),
        getAlternateLinksHeaderValue({
          config,
          request: getMockRequest('https://ca.example.com/users/42'),
          resolvedLocale: 'en',
          localizedPathnames: config.pathnames!['/users/[userId]']
        }),
        getAlternateLinksHeaderValue({
          config,
          request: getMockRequest('https://ca.example.com/fr/utilisateurs/42'),
          resolvedLocale: 'fr',
          localizedPathnames: config.pathnames!['/users/[userId]']
        }),
        getAlternateLinksHeaderValue({
          config,
          request: getMockRequest('https://fr.example.com/utilisateurs/42'),
          resolvedLocale: 'fr',
          localizedPathnames: config.pathnames!['/users/[userId]']
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
      const config: MiddlewareConfigWithDefaults<['en', 'es']> = {
        defaultLocale: 'en',
        locales: ['en', 'es'],
        alternateLinks: true,
        localePrefix: {mode: 'as-needed'},
        localeDetection: true
      };

      expect(
        getAlternateLinksHeaderValue({
          config,
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
      const config: MiddlewareConfigWithDefaults<['en', 'es']> = {
        defaultLocale: 'en',
        locales: ['en', 'es'],
        alternateLinks: true,
        localePrefix: {mode: 'as-needed'},
        localeDetection: true
      };

      expect(
        getAlternateLinksHeaderValue({
          config,
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
      const config: MiddlewareConfigWithDefaults<['en', 'es']> = {
        defaultLocale: 'en',
        locales: ['en', 'es'],
        alternateLinks: true,
        localePrefix: {mode: 'as-needed'},
        localeDetection: true
      };

      expect(
        getAlternateLinksHeaderValue({
          config,
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
