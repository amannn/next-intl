import {
  RoutingBaseConfigInput,
  receiveLocalePrefixConfig
} from '../../routing/config';
import {
  AllLocales,
  LocalePrefixConfigVerbose,
  Pathnames
} from '../../routing/types';

/**
 * Shared pathnames
 */

export type SharedNavigationRoutingConfigInput<Locales extends AllLocales> =
  RoutingBaseConfigInput<Locales> & {
    locales?: Locales;
  };

export type SharedNavigationRoutingConfig<Locales extends AllLocales> =
  SharedNavigationRoutingConfigInput<Locales> & {
    localePrefix: LocalePrefixConfigVerbose<Locales>;
  };

export function receiveSharedNavigationRoutingConfig<
  Locales extends AllLocales
>(
  input?: SharedNavigationRoutingConfigInput<Locales>
): SharedNavigationRoutingConfig<Locales> {
  return {
    ...input,
    localePrefix: receiveLocalePrefixConfig(input?.localePrefix)
  };
}

/**
 * Localized pathnames
 */

export type LocalizedNavigationRoutingConfigInput<
  Locales extends AllLocales,
  AppPathnames extends Pathnames<Locales>
> = RoutingBaseConfigInput<Locales> & {
  locales: Locales;

  /** Maps internal pathnames to external ones which can be localized per locale. */
  pathnames: AppPathnames;
};

export type LocalizedNavigationRoutingConfig<
  Locales extends AllLocales,
  AppPathnames extends Pathnames<Locales>
> = LocalizedNavigationRoutingConfigInput<Locales, AppPathnames> & {
  localePrefix: LocalePrefixConfigVerbose<Locales>;
};

export function receiveLocalizedNavigationRoutingConfig<
  Locales extends AllLocales,
  AppPathnames extends Pathnames<Locales>
>(
  input: LocalizedNavigationRoutingConfigInput<Locales, AppPathnames>
): LocalizedNavigationRoutingConfig<Locales, AppPathnames> {
  return {
    ...input,
    localePrefix: receiveLocalePrefixConfig(input?.localePrefix)
  };
}
