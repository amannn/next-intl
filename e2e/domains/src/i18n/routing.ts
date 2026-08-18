import {defineRouting} from 'next-intl/routing';

// Reproduction for https://github.com/amannn/next-intl/issues/2369
//
// Note that the domains are declared without a port, since the tests address
// the server via `127.0.0.1` and set the `host` header explicitly. This is
// what next-intl matches against and avoids the need for `/etc/hosts` entries.
export const EU_DOMAIN = 'example-eu.localhost';
export const DE_DOMAIN = 'example-de.localhost';

export const routing = defineRouting({
  locales: ['en', 'nl', 'de'],
  defaultLocale: 'en',

  // `nl` is served at a sub-path, `en` and `de` are the roots of their
  // respective domains and are therefore omitted from `prefixes`
  localePrefix: {mode: 'as-needed', prefixes: {nl: '/nl'}},

  domains: [
    {domain: EU_DOMAIN, defaultLocale: 'en', locales: ['en', 'nl']},
    {domain: DE_DOMAIN, defaultLocale: 'de', locales: ['de']}
  ]
});
