import {AllLocales, LocalePrefix, Pathnames} from '../shared/types';

type RoutingBaseConfig<Locales extends AllLocales> = {
  /** A list of all locales that are supported. */
  locales: Locales;

  /* Used by default if none of the defined locales match. */
  defaultLocale: Locales[number];

  /** The default locale can be used without a prefix (e.g. `/about`). If you prefer to have a prefix for the default locale as well (e.g. `/en/about`), you can switch this option to `always`.
   */
  localePrefix?: LocalePrefix;
};

export type DomainConfig<Locales extends AllLocales> = Omit<
  RoutingBaseConfig<Locales>,
  'locales' | 'localePrefix'
> & {
  /** The domain name (e.g. "example.com", "www.example.com" or "fr.example.com"). Note that the `x-forwarded-host` or alternatively the `host` header will be used to determine the requested domain. */
  domain: string;

  /** The locales availabe on this particular domain. */
  locales?: RoutingBaseConfig<Array<Locales[number]>>['locales'];
};

type MiddlewareConfig<Locales extends AllLocales> =
  RoutingBaseConfig<Locales> & {
    /** Can be used to change the locale handling per domain. */
    domains?: Array<DomainConfig<Locales>>;

    /** Sets the `Link` response header to notify search engines about content in other languages (defaults to `true`). See https://developers.google.com/search/docs/specialty/international/localized-versions#http */
    alternateLinks?: boolean;

    /** By setting this to `false`, the cookie as well as the `accept-language` header will no longer be used for locale detection. */
    localeDetection?: boolean;

    /** Maps internal pathnames to external ones which can be localized per locale. */
    pathnames?: Pathnames<Locales>;
    // Internal note: We want to accept this explicitly instead
    // of inferring it from `next-intl/config` so that:
    // a) The user gets TypeScript errors when there's a mismatch
    // b) The middleware can be used in a standalone fashion
  };

export type MiddlewareConfigWithDefaults<Locales extends AllLocales> =
  MiddlewareConfig<Locales> & {
    alternateLinks: boolean;
    localePrefix: LocalePrefix;
    localeDetection: boolean;
  };

export default MiddlewareConfig;
