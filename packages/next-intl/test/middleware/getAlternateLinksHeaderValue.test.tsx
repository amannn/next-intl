import {NextRequest} from 'next/server';
import {NextIntlMiddlewareConfigWithDefaults} from '../../src/middleware/NextIntlMiddlewareConfig';
import getAlternateLinksHeaderValue from '../../src/middleware/getAlternateLinksHeaderValue';

function getRequest(url = 'https://example.com/') {
  return {url} as NextRequest;
}

it('works for type prefix (as-needed)', () => {
  const config: NextIntlMiddlewareConfigWithDefaults = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    routing: {
      type: 'prefix',
      prefix: 'as-needed'
    }
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

it('works for type prefix (always)', () => {
  const config: NextIntlMiddlewareConfigWithDefaults = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    routing: {
      type: 'prefix',
      prefix: 'always'
    }
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

it('works for type domain', () => {
  const config: NextIntlMiddlewareConfigWithDefaults = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    alternateLinks: true,
    routing: {
      type: 'domain',
      domains: [
        {
          domain: 'example.com',
          locale: 'en'
        },
        {
          domain: 'example.es',
          locale: 'es'
        }
      ]
    }
  };

  expect(
    getAlternateLinksHeaderValue(config, getRequest()).split(', ')
  ).toEqual([
    '<https://example.com/>; rel="alternate"; hreflang="en"',
    '<https://example.es/>; rel="alternate"; hreflang="es"'
  ]);

  expect(
    getAlternateLinksHeaderValue(
      config,
      getRequest('https://example.es/')
    ).split(', ')
  ).toEqual([
    '<https://example.com/>; rel="alternate"; hreflang="en"',
    '<https://example.es/>; rel="alternate"; hreflang="es"'
  ]);

  expect(
    getAlternateLinksHeaderValue(
      config,
      getRequest('https://example.com/about')
    ).split(', ')
  ).toEqual([
    '<https://example.com/about>; rel="alternate"; hreflang="en"',
    '<https://example.es/about>; rel="alternate"; hreflang="es"'
  ]);
});
