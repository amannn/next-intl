import {
  Locales,
  LocalePrefix,
  LocalePrefixConfigVerbose,
  DomainsConfig,
  Pathnames
} from './types';

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

  /**
   * Can be used to change the locale handling per domain.
   * @see https://next-intl-docs.vercel.app/docs/routing#domains
   **/
  domains?: DomainsConfig<AppLocales>;
} & ([AppPathnames] extends [never]
  ? // https://discord.com/channels/997886693233393714/1278008400533520434
    // eslint-disable-next-line @typescript-eslint/ban-types
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
  AppPathnames extends Pathnames<AppLocales>
> = Omit<
  RoutingConfig<AppLocales, AppPathnames>,
  'defaultLocale' | 'locales' | 'pathnames'
> &
  Partial<
    Pick<RoutingConfig<AppLocales, AppPathnames>, 'defaultLocale' | 'locales'>
  >;

export type RoutingConfigLocalizedNavigation<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
> = Omit<
  RoutingConfig<AppLocales, AppPathnames>,
  'defaultLocale' | 'pathnames'
> &
  Partial<Pick<RoutingConfig<AppLocales, AppPathnames>, 'defaultLocale'>> & {
    pathnames: AppPathnames;
  };

export type ResolvedRoutingConfig<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales> = never
> = Omit<RoutingConfig<AppLocales, AppPathnames>, 'localePrefix'> & {
  localePrefix: LocalePrefixConfigVerbose<AppLocales>;
};

export function receiveRoutingConfig<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>,
  Config extends Partial<RoutingConfig<AppLocales, AppPathnames>>
>(input: Config) {
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
