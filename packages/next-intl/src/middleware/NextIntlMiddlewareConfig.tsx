export type RoutingConfigPrefix = {
  type: 'prefix';

  /** The default locale can be used without a prefix (e.g. `/about`). If you prefer to have a prefix for the default locale as well (e.g. `/en/about`), you can switch this option to `always`.
   */
  prefix?: 'as-needed' | 'always';
};

export type DomainConfig = {
  /** The domain name (e.g. "example.de" or "de.example.com"). */
  domain: string;

  locale: string;
};

export type RoutingConfigDomain = {
  type: 'domain';

  /** Provide a list of mappings between domains and locales. Note that the `x-forwarded-host` or alternatively the `host` header will be used to determine the requested domain. */
  domains: Array<{domain: string; locale: string}>;
};

type NextIntlMiddlewareConfig = {
  /** A list of all locales that are supported. */
  locales: Array<string>;

  /* Used by default if none of the defined locales match. */
  defaultLocale: string;

  /** Sets the `Link` response header to notify search engines about content in other languages (defaults to `true`). See https://developers.google.com/search/docs/specialty/international/localized-versions#http */
  alternateLinks?: boolean;

  /** @deprecated Deprecated in favour of `routing`. */
  domains?: Array<{domain: string; defaultLocale: string}>;

  routing?: RoutingConfigPrefix | RoutingConfigDomain;
};

export type NextIntlMiddlewareConfigWithDefaults = NextIntlMiddlewareConfig & {
  alternateLinks: boolean;
  routing: RoutingConfigPrefix | RoutingConfigDomain;
};

export default NextIntlMiddlewareConfig;
