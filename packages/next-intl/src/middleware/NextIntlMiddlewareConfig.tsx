type NextIntlMiddlewareConfig = {
  /** A list of all locales that are supported. */
  locales: Array<string>;

  /* If this locale is matched, pathnames work without a prefix (e.g. `/about`) */
  defaultLocale: string;

  /** Configure a list of domains where the `defaultLocale` is changed (e.g. `es.example.com/about`, `example.fr/about`). Note that the `x-forwarded-host` or alternatively the `host` header will be used to determine the requested domain. */
  domains?: Array<{domain: string; defaultLocale: string}>;

  /** Sets the `Link` response header to notify search engines about content in other languages (defaults to `true`). See https://developers.google.com/search/docs/specialty/international/localized-versions#http */
  alternateLinks?: boolean;
};

export default NextIntlMiddlewareConfig;
