import {
  Locales,
  LocalePrefix,
  LocalePrefixConfigVerbose,
  DomainsConfig
} from './types';

/**
 * Maintainer note: The config that is accepted by the middleware, the shared
 * and the localized pathnames navigation factory function is slightly
 * different. This type declares the shared base config that is accepted by all
 * of them. Properties that are different are declared in consuming types.
 */
export type RoutingBaseConfigInput<AppLocales extends Locales> = {
  /** @see https://next-intl-docs.vercel.app/docs/routing#locale-prefix */
  localePrefix?: LocalePrefix<AppLocales>;
  /** Can be used to change the locale handling per domain. */
  domains?: DomainsConfig<AppLocales>;
};

export function receiveLocalePrefixConfig<AppLocales extends Locales>(
  localePrefix?: LocalePrefix<AppLocales>
): LocalePrefixConfigVerbose<AppLocales> {
  return typeof localePrefix === 'object'
    ? localePrefix
    : {mode: localePrefix || 'always'};
}
