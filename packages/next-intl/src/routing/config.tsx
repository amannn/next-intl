import {
  AllLocales,
  DomainConfig,
  LocalePrefixConfig,
  LocalePrefixConfigVerbose
} from './types';

/**
 * Maintainer note: The config that is accepted by the middleware, the shared
 * and the localized pathnames navigation factory function is slightly
 * different. This type declares the shared base config that is accepted by all
 * of them. Properties that are different are declared in consuming types.
 */
export type RoutingBaseConfigInput<Locales extends AllLocales> = {
  /** @see https://next-intl-docs.vercel.app/docs/routing/middleware#locale-prefix */
  localePrefix?: LocalePrefixConfig<Locales>;
  /** Can be used to change the locale handling per domain. */
  domains?: Array<DomainConfig<Locales>>;
};

export function receiveLocalePrefixConfig<Locales extends AllLocales>(
  localePrefix?: LocalePrefixConfig<Locales>
): LocalePrefixConfigVerbose<Locales> {
  return typeof localePrefix === 'object'
    ? localePrefix
    : {mode: localePrefix || 'always'};
}
