import {
  Locales,
  LocalePrefix,
  LocalePrefixConfigVerbose,
  DomainsConfig,
  Pathnames
} from './types';

/**
 * Maintainer note: The config that is accepted by the middleware, the shared
 * and the localized pathnames navigation factory function is slightly
 * different. This type declares the shared base config that is accepted by all
 * of them. Properties that are different are declared in consuming types.
 */
export type RoutingConfig<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
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
  localePrefix?: LocalePrefix<AppLocales>;

  /** Can be used to change the locale handling per domain. */
  domains?: DomainsConfig<AppLocales>;

  /** A map of localized pathnames per locale. */
  pathnames?: AppPathnames;
};

export type ResolvedRoutingConfig<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
> = Omit<RoutingConfig<AppLocales, AppPathnames>, 'localePrefix'> & {
  localePrefix: LocalePrefixConfigVerbose<AppLocales>;
};

export function receiveRoutingConfig<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
>(
  input: RoutingConfig<AppLocales, AppPathnames>
): ResolvedRoutingConfig<AppLocales, AppPathnames> {
  return {
    ...input,
    localePrefix: receiveLocalePrefixConfig(input.localePrefix)
  };
}

export function receiveLocalePrefixConfig<AppLocales extends Locales>(
  localePrefix?: LocalePrefix<AppLocales>
): LocalePrefixConfigVerbose<AppLocales> {
  return typeof localePrefix === 'object'
    ? localePrefix
    : {mode: localePrefix || 'always'};
}
