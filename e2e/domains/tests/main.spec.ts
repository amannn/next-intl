import {expect, test as it} from '@playwright/test';
import {DE_DOMAIN, EU_DOMAIN} from '../src/i18n/routing';
import {type Result, follow, getPort} from './http';

const port = getPort();

function get(url: string): Promise<Result> {
  return follow(port, url);
}

it('serves the default locale of a domain unprefixed', async () => {
  const result = await get(`http://${DE_DOMAIN}/`);
  expect(result.hops).toEqual([
    {url: `http://${DE_DOMAIN}/`, status: 200, location: undefined}
  ]);
  expect(result.body).toContain('>de<');
});

it('serves a secondary locale of a domain with a prefix', async () => {
  const result = await get(`http://${EU_DOMAIN}/nl`);
  expect(result.hops).toEqual([
    {url: `http://${EU_DOMAIN}/nl`, status: 200, location: undefined}
  ]);
  expect(result.body).toContain('>nl<');
});

it('redirects a locale that is served on another domain to that domain', async () => {
  const result = await get(`http://${EU_DOMAIN}/de`);

  // The final destination is correct: `de` is the `defaultLocale` of
  // `DE_DOMAIN` and is served unprefixed there (`as-needed`).
  expect(result.url).toBe(`http://${DE_DOMAIN}/`);
  expect(result.status).toBe(200);
  expect(result.body).toContain('>de<');

  // … however, the cross-domain redirect should normalize the prefix
  // right away and reach the destination in a single redirect — like the
  // same-domain case below. Currently this fails: the `/de` prefix is
  // carried over to the target domain and only removed by a second
  // redirect. See https://github.com/amannn/next-intl/issues/2369.
  expect(result.hops).toEqual([
    {
      url: `http://${EU_DOMAIN}/de`,
      status: 307,
      location: `http://${DE_DOMAIN}/`
    },
    {url: `http://${DE_DOMAIN}/`, status: 200, location: undefined}
  ]);
});

it('takes the same extra redirect in the opposite direction', async () => {
  // The extra redirect is not specific to `prefixes`, it applies to every
  // cross-domain redirect where the target locale is the `defaultLocale` of
  // the target domain while `as-needed` is used.
  const result = await get(`http://${DE_DOMAIN}/en`);

  expect(result.url).toBe(`http://${EU_DOMAIN}/`);
  expect(result.status).toBe(200);
  expect(result.body).toContain('>en<');

  // Same expectation as above: a single redirect to the unprefixed URL.
  // Currently fails with the extra hop via `${EU_DOMAIN}/en`.
  expect(result.hops).toEqual([
    {
      url: `http://${DE_DOMAIN}/en`,
      status: 307,
      location: `http://${EU_DOMAIN}/`
    },
    {url: `http://${EU_DOMAIN}/`, status: 200, location: undefined}
  ]);
});

it('redirects a nested pathname of a locale that is served on another domain', async () => {
  const result = await get(`http://${EU_DOMAIN}/de/contact`);

  expect(result.url).toBe(`http://${DE_DOMAIN}/contact`);
  expect(result.status).toBe(200);
  expect(result.body).toContain('>contact<');

  // Same as above: the redirect should land on the unprefixed URL
  // directly. Currently fails with the extra hop via `/de/contact`.
  expect(result.hops).toEqual([
    {
      url: `http://${EU_DOMAIN}/de/contact`,
      status: 307,
      location: `http://${DE_DOMAIN}/contact`
    },
    {url: `http://${DE_DOMAIN}/contact`, status: 200, location: undefined}
  ]);
});

it('redirects to an unprefixed pathname on the same domain in a single hop', async () => {
  // For comparison: when the target domain is the current domain, the
  // prefix is removed right away (`redirect()` normalizes in this case).
  const result = await get(`http://${DE_DOMAIN}/de/contact`);
  expect(result.hops).toEqual([
    {
      url: `http://${DE_DOMAIN}/de/contact`,
      status: 307,
      location: `http://${DE_DOMAIN}/contact`
    },
    {url: `http://${DE_DOMAIN}/contact`, status: 200, location: undefined}
  ]);
});
