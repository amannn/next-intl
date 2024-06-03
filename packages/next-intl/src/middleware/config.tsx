import {
  RoutingBaseConfigInput,
  receiveLocalePrefixConfig
} from '../routing/config';
import {
  AllLocales,
  LocalePrefixConfigVerbose,
  Pathnames
} from '../routing/types';

export type MiddlewareRoutingConfigInput<
  Locales extends AllLocales,
  AppPathnames extends Pathnames<Locales>
> = RoutingBaseConfigInput<Locales> & {
  locales: Locales;
  defaultLocale: Locales[number];

  /** Sets the `Link` response header to notify search engines about content in other languages (defaults to `true`). See https://developers.google.com/search/docs/specialty/international/localized-versions#http */
  alternateLinks?: boolean;

  /** By setting this to `false`, the cookie as well as the `accept-language` header will no longer be used for locale detection. */
  localeDetection?: boolean;

  /** Maps internal pathnames to external ones which can be localized per locale. */
  pathnames?: AppPathnames;
};

export type MiddlewareRoutingConfig<
  Locales extends AllLocales,
  AppPathnames extends Pathnames<Locales>
> = Omit<
  MiddlewareRoutingConfigInput<Locales, AppPathnames>,
  'alternateLinks' | 'localeDetection' | 'localePrefix'
> & {
  alternateLinks: boolean;
  localeDetection: boolean;
  localePrefix: LocalePrefixConfigVerbose<Locales>;
};

export function receiveConfig<
  Locales extends AllLocales,
  AppPathnames extends Pathnames<Locales>
>(
  input: MiddlewareRoutingConfigInput<Locales, AppPathnames>
): MiddlewareRoutingConfig<Locales, AppPathnames> {
  return {
    ...input,
    alternateLinks: input?.alternateLinks ?? true,
    localeDetection: input?.localeDetection ?? true,
    localePrefix: receiveLocalePrefixConfig(input?.localePrefix)
  };
}
