import type {NextResponse} from 'next/server';
import {
  DomainsConfig,
  LocalePrefix,
  LocalePrefixConfigVerbose,
  LocalePrefixMode,
  Locales,
  Pathnames
} from './types.tsx';

type CookieAttributes = Pick<
  NonNullable<Parameters<typeof NextResponse.prototype.cookies.set>['2']>,
  | 'maxAge'
  | 'domain'
  | 'partitioned'
  | 'path'
  | 'priority'
  | 'sameSite'
  | 'secure'
  | 'name'
  // Not:
  // - 'httpOnly' (the client side needs to read the cookie)
  // - 'value' (only the middleware knows this)
  // - 'expires' (use `maxAge` instead)
>;

export type RoutingConfig<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
> = {
  /**
   * All available locales.
   * @see https://next-intl-docs.vercel.app/docs/routing
   */
  locales: AppLocales;

  /**
   * Used when no locale matches.
   * @see https://next-intl-docs.vercel.app/docs/routing
   */
  defaultLocale: AppLocales[number];

  /**
   * Configures whether and which prefix is shown for a given locale.
   * @see https://next-intl-docs.vercel.app/docs/routing#locale-prefix
   **/
  localePrefix?: LocalePrefix<AppLocales, AppLocalePrefixMode>;

  /**
   * Can be used to change the locale handling per domain.
   * @see https://next-intl-docs.vercel.app/docs/routing#domains
   **/
  domains?: AppDomains;

  /**
   * Can be used to disable the locale cookie or to customize it.
   * @see https://next-intl-docs.vercel.app/docs/routing/middleware#locale-cookie
   */
  localeCookie?: boolean | CookieAttributes;

  /**
   * Sets the `Link` response header to notify search engines about content in other languages (defaults to `true`). See https://developers.google.com/search/docs/specialty/international/localized-versions#http
   * @see https://next-intl-docs.vercel.app/docs/routing/middleware#alternate-links
   **/
  alternateLinks?: boolean;

  /**
   * By setting this to `false`, the cookie as well as the `accept-language` header will no longer be used for locale detection.
   * @see https://next-intl-docs.vercel.app/docs/routing/middleware#locale-detection
   **/
  localeDetection?: boolean;
} & ([AppPathnames] extends [never]
  ? // https://discord.com/channels/997886693233393714/1278008400533520434
    {}
  : {
      /**
       * A map of localized pathnames per locale.
       * @see https://next-intl-docs.vercel.app/docs/routing#pathnames
       **/
      pathnames: AppPathnames;
    });

export type RoutingConfigSharedNavigation<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppDomains extends DomainsConfig<AppLocales> = never
> = Omit<
  RoutingConfig<AppLocales, AppLocalePrefixMode, never, AppDomains>,
  'defaultLocale' | 'locales' | 'pathnames'
> &
  Partial<
    Pick<
      RoutingConfig<AppLocales, never, never, AppDomains>,
      'defaultLocale' | 'locales'
    >
  >;

export type RoutingConfigLocalizedNavigation<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales>,
  AppDomains extends DomainsConfig<AppLocales> = never
> = Omit<
  RoutingConfig<AppLocales, AppLocalePrefixMode, AppPathnames, AppDomains>,
  'defaultLocale' | 'pathnames'
> &
  Partial<
    Pick<
      RoutingConfig<AppLocales, AppLocalePrefixMode, AppPathnames, AppDomains>,
      'defaultLocale'
    >
  > & {
    pathnames: AppPathnames;
  };

export type ResolvedRoutingConfig<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
> = Omit<
  RoutingConfig<AppLocales, AppLocalePrefixMode, AppPathnames, AppDomains>,
  'localePrefix' | 'localeCookie' | 'alternateLinks' | 'localeDetection'
> & {
  localePrefix: LocalePrefixConfigVerbose<AppLocales, AppLocalePrefixMode>;
  localeCookie: InitializedLocaleCookieConfig;
  alternateLinks: boolean;
  localeDetection: boolean;
};

export function receiveRoutingConfig<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined,
  Config extends Partial<
    RoutingConfig<AppLocales, AppLocalePrefixMode, AppPathnames, AppDomains>
  >
>(input: Config) {
  return {
    ...(input as Omit<
      Config,
      'localePrefix' | 'localeCookie' | 'localeDetection' | 'alternateLinks'
    >),
    localePrefix: receiveLocalePrefixConfig(input.localePrefix),
    localeCookie: receiveLocaleCookie(input.localeCookie),
    localeDetection: input.localeDetection ?? true,
    alternateLinks: input.alternateLinks ?? true
  };
}

export function receiveLocaleCookie(
  localeCookie?: boolean | CookieAttributes
): InitializedLocaleCookieConfig {
  return (localeCookie ?? true)
    ? {
        name: 'NEXT_LOCALE',
        maxAge: 31536000, // 1 year
        sameSite: 'lax',
        ...(typeof localeCookie === 'object' && localeCookie)

        // `path` needs to be provided based on a detected base path
        // that depends on the environment when setting a cookie
      }
    : false;
}

export type InitializedLocaleCookieConfig = false | LocaleCookieConfig;

export type LocaleCookieConfig = Omit<
  CookieAttributes,
  'name' | 'maxAge' | 'sameSite'
> &
  Required<Pick<CookieAttributes, 'name' | 'maxAge' | 'sameSite'>>;

export function receiveLocalePrefixConfig<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode
>(localePrefix?: LocalePrefix<AppLocales, AppLocalePrefixMode>) {
  return (
    typeof localePrefix === 'object'
      ? localePrefix
      : {mode: localePrefix || 'always'}
  ) as LocalePrefixConfigVerbose<AppLocales, AppLocalePrefixMode>;
}
