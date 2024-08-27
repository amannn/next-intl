import {RoutingConfig, receiveLocalePrefixConfig} from '../../routing/config';
import {
  Locales,
  LocalePrefixConfigVerbose,
  Pathnames
} from '../../routing/types';

/**
 * Shared pathnames
 */

export type SharedNavigationRoutingConfigInput<AppLocales extends Locales> =
  RoutingConfig<AppLocales> & {
    locales?: AppLocales;
  };

export type SharedNavigationRoutingConfig<AppLocales extends Locales> =
  SharedNavigationRoutingConfigInput<AppLocales> & {
    localePrefix: LocalePrefixConfigVerbose<AppLocales>;
  };

export function receiveSharedNavigationRoutingConfig<
  AppLocales extends Locales
>(
  input?: SharedNavigationRoutingConfigInput<AppLocales>
): SharedNavigationRoutingConfig<AppLocales> {
  return {
    ...input,
    localePrefix: receiveLocalePrefixConfig(input?.localePrefix)
  };
}

/**
 * Localized pathnames
 */

export type LocalizedNavigationRoutingConfigInput<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
> = RoutingConfig<AppLocales> & {
  locales: AppLocales;

  /** Maps internal pathnames to external ones which can be localized per locale. */
  pathnames: AppPathnames;
};

export type LocalizedNavigationRoutingConfig<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
> = LocalizedNavigationRoutingConfigInput<AppLocales, AppPathnames> & {
  localePrefix: LocalePrefixConfigVerbose<AppLocales>;
};

export function receiveLocalizedNavigationRoutingConfig<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
>(
  input: LocalizedNavigationRoutingConfigInput<AppLocales, AppPathnames>
): LocalizedNavigationRoutingConfig<AppLocales, AppPathnames> {
  return {
    ...input,
    localePrefix: receiveLocalePrefixConfig(input?.localePrefix)
  };
}
