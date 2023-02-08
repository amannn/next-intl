type NextIntlMiddlewareConfig = {
  /** A list of all locales that are supported. */
  locales: Array<string>;

  /* If this locale is matched, pathnames work without a prefix (e.g. `/about`) */
  defaultLocale: string;

  /** Configure a list of domains where the `defaultLocale` is changed (e.g. `es.example.com/about`, `example.fr/about`). Note that the `x-forwarded-host` or alternatively the `host` header will be used to determine the requested domain. */
  domains?: Array<{domain: string; defaultLocale: string}>;
};

export default NextIntlMiddlewareConfig;
