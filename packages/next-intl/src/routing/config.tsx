import {
  Locales,
  LocalePrefix,
  LocalePrefixConfigVerbose,
  DomainsConfig,
  Pathnames,
  LocalePrefixMode
} from './types';

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
  'localePrefix'
> & {
  localePrefix: LocalePrefixConfigVerbose<AppLocales, AppLocalePrefixMode>;
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
    ...(input as Omit<Config, 'localePrefix'>),
    localePrefix: receiveLocalePrefixConfig(input?.localePrefix)
  };
}

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
