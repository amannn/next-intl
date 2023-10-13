// @vitest-environment edge-runtime

import {NextRequest, NextResponse} from 'next/server';
import {it, expect} from 'vitest';
import {MiddlewareConfigWithDefaults} from '../../src/middleware/NextIntlMiddlewareConfig';
import getAlternateLinksHeaderValue from '../../src/middleware/getAlternateLinksHeaderValue';
import {Pathnames} from '../../src/navigation';

function rewrite(
  _: NextRequest,
  ...args: Parameters<typeof NextResponse.rewrite>
) {
  return Promise.resolve(NextResponse.rewrite(...args));
}

it('works for prefixed routing (as-needed)', () => {
  const config: MiddlewareConfigWithDefaults<['en', 'es']> = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true,
    rewrite
  };

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://example.com/'),
      resolvedLocale: 'en'
    }).split(', ')
  ).toEqual([
    '<https://example.com/>; rel="alternate"; hreflang="en"',
    '<https://example.com/es>; rel="alternate"; hreflang="es"',
    '<https://example.com/>; rel="alternate"; hreflang="x-default"'
  ]);

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://example.com/about'),
      resolvedLocale: 'en'
    }).split(', ')
  ).toEqual([
    '<https://example.com/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
  ]);
});

it('works for prefixed routing (as-needed) with `pathnames`', () => {
  const config: MiddlewareConfigWithDefaults<['en', 'de']> = {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true,
    rewrite
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
      request: new NextRequest('https://example.com/'),
      resolvedLocale: 'en',
      localizedPathnames: pathnames['/']
    }).split(', ')
  ).toEqual([
    '<https://example.com/>; rel="alternate"; hreflang="en"',
    '<https://example.com/de>; rel="alternate"; hreflang="de"',
    '<https://example.com/>; rel="alternate"; hreflang="x-default"'
  ]);

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://example.com/about'),
      resolvedLocale: 'en',
      localizedPathnames: pathnames['/about']
    }).split(', ')
  ).toEqual([
    '<https://example.com/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/de/ueber>; rel="alternate"; hreflang="de"',
    '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
  ]);

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://example.com/de/ueber'),
      resolvedLocale: 'de',
      localizedPathnames: pathnames['/about']
    }).split(', ')
  ).toEqual([
    '<https://example.com/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/de/ueber>; rel="alternate"; hreflang="de"',
    '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
  ]);

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://example.com/users/2'),
      resolvedLocale: 'en',
      localizedPathnames: pathnames['/users/[userId]']
    }).split(', ')
  ).toEqual([
    '<https://example.com/users/2>; rel="alternate"; hreflang="en"',
    '<https://example.com/de/benutzer/2>; rel="alternate"; hreflang="de"',
    '<https://example.com/users/2>; rel="alternate"; hreflang="x-default"'
  ]);
});

it('works for prefixed routing (always)', () => {
  const config: MiddlewareConfigWithDefaults<['en', 'es']> = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    localePrefix: 'always',
    localeDetection: true,
    rewrite
  };

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://example.com/'),
      resolvedLocale: 'en'
    }).split(', ')
  ).toEqual([
    '<https://example.com/en>; rel="alternate"; hreflang="en"',
    '<https://example.com/es>; rel="alternate"; hreflang="es"',
    '<https://example.com/>; rel="alternate"; hreflang="x-default"'
  ]);

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://example.com/about'),
      resolvedLocale: 'en'
    }).split(', ')
  ).toEqual([
    '<https://example.com/en/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
  ]);
});

it("works for type domain with `localePrefix: 'as-needed'`", () => {
  const config: MiddlewareConfigWithDefaults<['en', 'es', 'fr']> = {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true,
    rewrite,
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
      request: new NextRequest('https://example.com/'),
      resolvedLocale: 'en'
    }).split(', '),
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://example.es'),
      resolvedLocale: 'es'
    }).split(', ')
  ].forEach((links) => {
    expect(links).toEqual([
      '<https://example.com/>; rel="alternate"; hreflang="en"',
      '<https://example.ca/>; rel="alternate"; hreflang="en"',
      '<https://example.com/es>; rel="alternate"; hreflang="es"',
      '<https://example.es/>; rel="alternate"; hreflang="es"',
      '<https://example.com/fr>; rel="alternate"; hreflang="fr"',
      '<https://example.ca/fr>; rel="alternate"; hreflang="fr"'
    ]);
  });

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://example.com/about'),
      resolvedLocale: 'en'
    }).split(', ')
  ).toEqual([
    '<https://example.com/about>; rel="alternate"; hreflang="en"',
    '<https://example.ca/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com/fr/about>; rel="alternate"; hreflang="fr"',
    '<https://example.ca/fr/about>; rel="alternate"; hreflang="fr"'
  ]);
});

it("works for type domain with `localePrefix: 'always'`", () => {
  const config: MiddlewareConfigWithDefaults<['en', 'es', 'fr']> = {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
    alternateLinks: true,
    localePrefix: 'always',
    localeDetection: true,
    rewrite,
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
      request: new NextRequest('https://example.com/'),
      resolvedLocale: 'en'
    }).split(', '),
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://example.es'),
      resolvedLocale: 'es'
    }).split(', ')
  ].forEach((links) => {
    expect(links).toEqual([
      '<https://example.com/en>; rel="alternate"; hreflang="en"',
      '<https://example.ca/en>; rel="alternate"; hreflang="en"',
      '<https://example.com/es>; rel="alternate"; hreflang="es"',
      '<https://example.es/es>; rel="alternate"; hreflang="es"',
      '<https://example.com/fr>; rel="alternate"; hreflang="fr"',
      '<https://example.ca/fr>; rel="alternate"; hreflang="fr"'
    ]);
  });

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://example.com/about'),
      resolvedLocale: 'en'
    }).split(', ')
  ).toEqual([
    '<https://example.com/en/about>; rel="alternate"; hreflang="en"',
    '<https://example.ca/en/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.es/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com/fr/about>; rel="alternate"; hreflang="fr"',
    '<https://example.ca/fr/about>; rel="alternate"; hreflang="fr"'
  ]);
});

it("works for type domain with `localePrefix: 'as-needed' with `pathnames``", () => {
  const config: MiddlewareConfigWithDefaults<['en', 'fr']> = {
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true,
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    rewrite,
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
      request: new NextRequest('https://en.example.com/'),
      resolvedLocale: 'en'
    }),
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://ca.example.com'),
      resolvedLocale: 'en'
    }),
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://ca.example.com/fr'),
      resolvedLocale: 'fr'
    }),
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://fr.example.com'),
      resolvedLocale: 'fr'
    })
  ]
    .map((links) => links.split(', '))
    .forEach((links) => {
      expect(links).toEqual([
        '<https://en.example.com/>; rel="alternate"; hreflang="en"',
        '<https://ca.example.com/>; rel="alternate"; hreflang="en"',
        '<https://ca.example.com/fr>; rel="alternate"; hreflang="fr"',
        '<https://fr.example.com/>; rel="alternate"; hreflang="fr"'
      ]);
    });

  [
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://en.example.com/about'),
      resolvedLocale: 'en',
      localizedPathnames: config.pathnames!['/about']
    }),
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://ca.example.com/about'),
      resolvedLocale: 'en',
      localizedPathnames: config.pathnames!['/about']
    }),
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://ca.example.com/fr/a-propos'),
      resolvedLocale: 'fr',
      localizedPathnames: config.pathnames!['/about']
    }),
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://fr.example.com/a-propos'),
      resolvedLocale: 'fr',
      localizedPathnames: config.pathnames!['/about']
    })
  ]
    .map((links) => links.split(', '))
    .forEach((links) => {
      expect(links).toEqual([
        '<https://en.example.com/about>; rel="alternate"; hreflang="en"',
        '<https://ca.example.com/about>; rel="alternate"; hreflang="en"',
        '<https://ca.example.com/fr/a-propos>; rel="alternate"; hreflang="fr"',
        '<https://fr.example.com/a-propos>; rel="alternate"; hreflang="fr"'
      ]);
    });

  [
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://en.example.com/users/42'),
      resolvedLocale: 'en',
      localizedPathnames: config.pathnames!['/users/[userId]']
    }),
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://ca.example.com/users/42'),
      resolvedLocale: 'en',
      localizedPathnames: config.pathnames!['/users/[userId]']
    }),
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://ca.example.com/fr/utilisateurs/42'),
      resolvedLocale: 'fr',
      localizedPathnames: config.pathnames!['/users/[userId]']
    }),
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('https://fr.example.com/utilisateurs/42'),
      resolvedLocale: 'fr',
      localizedPathnames: config.pathnames!['/users/[userId]']
    })
  ]
    .map((links) => links.split(', '))
    .forEach((links) => {
      expect(links).toEqual([
        '<https://en.example.com/users/42>; rel="alternate"; hreflang="en"',
        '<https://ca.example.com/users/42>; rel="alternate"; hreflang="en"',
        '<https://ca.example.com/fr/utilisateurs/42>; rel="alternate"; hreflang="fr"',
        '<https://fr.example.com/utilisateurs/42>; rel="alternate"; hreflang="fr"'
      ]);
    });
});

it('uses the external host name from headers instead of the url of the incoming request (relevant when running the app behind a proxy)', () => {
  const config: MiddlewareConfigWithDefaults<['en', 'es']> = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true,
    rewrite
  };

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('http://127.0.0.1/about', {
        headers: {
          host: 'example.com',
          'x-forwarded-host': 'example.com',
          'x-forwarded-proto': 'https'
        }
      }),
      resolvedLocale: 'en'
    }).split(', ')
  ).toEqual([
    '<https://example.com/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
  ]);
});

it('keeps the port of an external host if provided', () => {
  const config: MiddlewareConfigWithDefaults<['en', 'es']> = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true,
    rewrite
  };

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('http://127.0.0.1/about', {
        headers: {
          host: 'example.com:3000',
          'x-forwarded-host': 'example.com:3000',
          'x-forwarded-proto': 'https'
        }
      }),
      resolvedLocale: 'en'
    }).split(', ')
  ).toEqual([
    '<https://example.com:3000/about>; rel="alternate"; hreflang="en"',
    '<https://example.com:3000/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com:3000/about>; rel="alternate"; hreflang="x-default"'
  ]);
});

it('uses the external host name and the port from headers instead of the url with port of the incoming request (relevant when running the app behind a proxy)', () => {
  const config: MiddlewareConfigWithDefaults<['en', 'es']> = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true,
    rewrite
  };

  expect(
    getAlternateLinksHeaderValue({
      config,
      request: new NextRequest('http://127.0.0.1:3000/about', {
        headers: {
          host: 'example.com',
          'x-forwarded-host': 'example.com',
          'x-forwarded-proto': 'https'
        }
      }),
      resolvedLocale: 'en'
    }).split(', ')
  ).toEqual([
    '<https://example.com/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
  ]);
});
