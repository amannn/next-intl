import {NextRequest} from 'next/server';
import {it, expect} from 'vitest';
import {MiddlewareConfigWithDefaults} from '../../src/middleware/NextIntlMiddlewareConfig';
import getAlternateLinksHeaderValue from '../../src/middleware/getAlternateLinksHeaderValue';

it('works for prefixed routing (as-needed)', () => {
  const config: MiddlewareConfigWithDefaults = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true
  };

  expect(
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('https://example.com/')
    ).split(', ')
  ).toEqual([
    '<https://example.com/>; rel="alternate"; hreflang="en"',
    '<https://example.com/es>; rel="alternate"; hreflang="es"',
    '<https://example.com/>; rel="alternate"; hreflang="x-default"'
  ]);

  expect(
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('https://example.com/about')
    ).split(', ')
  ).toEqual([
    '<https://example.com/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
  ]);
});

it('works for prefixed routing (always)', () => {
  const config: MiddlewareConfigWithDefaults = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    localePrefix: 'always',
    localeDetection: true
  };

  expect(
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('https://example.com/')
    ).split(', ')
  ).toEqual([
    '<https://example.com/en>; rel="alternate"; hreflang="en"',
    '<https://example.com/es>; rel="alternate"; hreflang="es"',
    '<https://example.com/>; rel="alternate"; hreflang="x-default"'
  ]);

  expect(
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('https://example.com/about')
    ).split(', ')
  ).toEqual([
    '<https://example.com/en/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
  ]);
});

it("works for type domain with `localePrefix: 'as-needed'`", () => {
  const config: MiddlewareConfigWithDefaults = {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
    alternateLinks: true,
    localePrefix: 'as-needed',
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
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('https://example.com/')
    ).split(', '),
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('https://example.es/')
    ).split(', ')
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
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('https://example.com/about')
    ).split(', ')
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
  const config: MiddlewareConfigWithDefaults = {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
    alternateLinks: true,
    localePrefix: 'always',
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
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('https://example.com/')
    ).split(', '),
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('https://example.es/')
    ).split(', ')
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
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('https://example.com/about')
    ).split(', ')
  ).toEqual([
    '<https://example.com/en/about>; rel="alternate"; hreflang="en"',
    '<https://example.ca/en/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.es/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com/fr/about>; rel="alternate"; hreflang="fr"',
    '<https://example.ca/fr/about>; rel="alternate"; hreflang="fr"'
  ]);
});

it('uses the external host name from headers instead of the url of the incoming request (relevant when running the app behind a proxy)', () => {
  const config: MiddlewareConfigWithDefaults = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true
  };

  expect(
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('http://127.0.0.1/about', {
        headers: {
          host: 'example.com',
          'x-forwarded-host': 'example.com',
          'x-forwarded-proto': 'https'
        }
      })
    ).split(', ')
  ).toEqual([
    '<https://example.com/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
  ]);
});

it('keeps the port of an external host if provided', () => {
  const config: MiddlewareConfigWithDefaults = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true
  };

  expect(
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('http://127.0.0.1/about', {
        headers: {
          host: 'example.com:3000',
          'x-forwarded-host': 'example.com:3000',
          'x-forwarded-proto': 'https'
        }
      })
    ).split(', ')
  ).toEqual([
    '<https://example.com:3000/about>; rel="alternate"; hreflang="en"',
    '<https://example.com:3000/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com:3000/about>; rel="alternate"; hreflang="x-default"'
  ]);
});

it('uses the external host name and the port from headers instead of the url with port of the incoming request (relevant when running the app behind a proxy)', () => {
  const config: MiddlewareConfigWithDefaults = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true
  };

  expect(
    getAlternateLinksHeaderValue(
      config,
      new NextRequest('http://127.0.0.1:3000/about', {
        headers: {
          host: 'example.com',
          'x-forwarded-host': 'example.com',
          'x-forwarded-proto': 'https'
        }
      })
    ).split(', ')
  ).toEqual([
    '<https://example.com/about>; rel="alternate"; hreflang="en"',
    '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
    '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
  ]);
});
