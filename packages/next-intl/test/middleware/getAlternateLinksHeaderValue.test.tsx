import {NextRequest} from 'next/server';
import {MiddlewareConfigWithDefaults} from '../../src/middleware/NextIntlMiddlewareConfig';
import getAlternateLinksHeaderValue from '../../src/middleware/getAlternateLinksHeaderValue';

function getRequest(url = 'https://example.com/') {
  return {url} as NextRequest;
}

it('works for prefixed routing (as-needed)', () => {
  const config: MiddlewareConfigWithDefaults = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    localePrefix: 'as-needed',
    localeDetection: true
  };

  expect(
    getAlternateLinksHeaderValue(config, getRequest()).split(', ')
  ).toEqual([
    '<https://example.com/>; rel="alternate"; hreflang="en"',
    '<https://example.com/es>; rel="alternate"; hreflang="es"',
    '<https://example.com/>; rel="alternate"; hreflang="x-default"'
  ]);

  expect(
    getAlternateLinksHeaderValue(
      config,
      getRequest('https://example.com/about')
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
    getAlternateLinksHeaderValue(config, getRequest()).split(', ')
  ).toEqual([
    '<https://example.com/en>; rel="alternate"; hreflang="en"',
    '<https://example.com/es>; rel="alternate"; hreflang="es"',
    '<https://example.com/>; rel="alternate"; hreflang="x-default"'
  ]);

  expect(
    getAlternateLinksHeaderValue(
      config,
      getRequest('https://example.com/about')
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
    getAlternateLinksHeaderValue(config, getRequest()).split(', '),
    getAlternateLinksHeaderValue(
      config,
      getRequest('https://example.es/')
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
      getRequest('https://example.com/about')
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
    getAlternateLinksHeaderValue(config, getRequest()).split(', '),
    getAlternateLinksHeaderValue(
      config,
      getRequest('https://example.es/')
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
      getRequest('https://example.com/about')
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
