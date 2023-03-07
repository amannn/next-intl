import {NextRequest} from 'next/server';
import getAlternateLinksHeaderValue from '../../src/middleware/getAlternateLinksHeaderValue';

function getRequest(url = 'https://example.com/') {
  return {url} as NextRequest;
}

it('works for multiple locales', () => {
  const config = {
    defaultLocale: 'en',
    locales: ['en', 'es']
  };

  expect(getAlternateLinksHeaderValue(config, getRequest())).toEqual(
    [
      '<https://example.com/en>; rel="alternate"; hreflang="en"',
      '<https://example.com/es>; rel="alternate"; hreflang="es"',
      '<https://example.com/>; rel="alternate"; hreflang="x-default"'
    ].join(', ')
  );

  expect(
    getAlternateLinksHeaderValue(
      config,
      getRequest('https://example.com/about')
    )
  ).toEqual(
    [
      '<https://example.com/en/about>; rel="alternate"; hreflang="en"',
      '<https://example.com/es/about>; rel="alternate"; hreflang="es"',
      '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
    ].join(', ')
  );
});

it('uses domains', () => {
  const config = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    domains: [
      {
        domain: 'example.com',
        defaultLocale: 'en'
      },
      {
        domain: 'example.es',
        defaultLocale: 'es'
      }
    ]
  };

  expect(getAlternateLinksHeaderValue(config, getRequest())).toEqual(
    [
      '<https://example.com/>; rel="alternate"; hreflang="en"',
      '<https://example.es/>; rel="alternate"; hreflang="es"',
      '<https://example.com/>; rel="alternate"; hreflang="x-default"'
    ].join(', ')
  );

  expect(
    getAlternateLinksHeaderValue(config, getRequest('https://example.es/'))
  ).toEqual(
    [
      '<https://example.com/>; rel="alternate"; hreflang="en"',
      '<https://example.es/>; rel="alternate"; hreflang="es"',
      '<https://example.com/>; rel="alternate"; hreflang="x-default"'
    ].join(', ')
  );

  expect(
    getAlternateLinksHeaderValue(
      config,
      getRequest('https://example.com/about')
    )
  ).toEqual(
    [
      '<https://example.com/about>; rel="alternate"; hreflang="en"',
      '<https://example.es/about>; rel="alternate"; hreflang="es"',
      '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
    ].join(', ')
  );
});

it('uses mixed domains', () => {
  const config = {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    domains: [
      {
        domain: 'example.es',
        defaultLocale: 'es'
      }
    ]
  };

  expect(getAlternateLinksHeaderValue(config, getRequest())).toEqual(
    [
      '<https://example.com/en>; rel="alternate"; hreflang="en"',
      '<https://example.es/>; rel="alternate"; hreflang="es"',
      '<https://example.com/>; rel="alternate"; hreflang="x-default"'
    ].join(', ')
  );

  expect(
    getAlternateLinksHeaderValue(
      config,
      getRequest('https://example.com/about')
    )
  ).toEqual(
    [
      '<https://example.com/en/about>; rel="alternate"; hreflang="en"',
      '<https://example.es/about>; rel="alternate"; hreflang="es"',
      '<https://example.com/about>; rel="alternate"; hreflang="x-default"'
    ].join(', ')
  );

  expect(
    getAlternateLinksHeaderValue(config, {
      url: 'https://example.es/'
    } as NextRequest)
  ).toEqual(
    [
      '<https://example.es/en>; rel="alternate"; hreflang="en"',
      '<https://example.es/>; rel="alternate"; hreflang="es"',
      '<https://example.es/>; rel="alternate"; hreflang="x-default"'
    ].join(', ')
  );
});
