import {
  RoutingBaseConfigInput,
  receiveLocalePrefixConfig
} from '../routing/config';
import {Locales, LocalePrefixConfigVerbose, Pathnames} from '../routing/types';

export type MiddlewareRoutingConfigInput<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
> = RoutingBaseConfigInput<AppLocales> & {
  locales: AppLocales;
  defaultLocale: AppLocales[number];

  /** Sets the `Link` response header to notify search engines about content in other languages (defaults to `true`). See https://developers.google.com/search/docs/specialty/international/localized-versions#http */
  alternateLinks?: boolean;

  /** By setting this to `false`, the cookie as well as the `accept-language` header will no longer be used for locale detection. */
  localeDetection?: boolean;

  /** Maps internal pathnames to external ones which can be localized per locale. */
  pathnames?: AppPathnames;
};

export type MiddlewareRoutingConfig<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
> = Omit<
  MiddlewareRoutingConfigInput<AppLocales, AppPathnames>,
  'alternateLinks' | 'localeDetection' | 'localePrefix'
> & {
  alternateLinks: boolean;
  localeDetection: boolean;
  localePrefix: LocalePrefixConfigVerbose<AppLocales>;
};

export function receiveConfig<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
>(
  input: MiddlewareRoutingConfigInput<AppLocales, AppPathnames>
): MiddlewareRoutingConfig<AppLocales, AppPathnames> {
  return {
    ...input,
    alternateLinks: input?.alternateLinks ?? true,
    localeDetection: input?.localeDetection ?? true,
    localePrefix: receiveLocalePrefixConfig(input?.localePrefix)
  };
}
