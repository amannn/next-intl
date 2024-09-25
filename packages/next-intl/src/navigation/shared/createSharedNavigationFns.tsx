import {
  permanentRedirect as nextPermanentRedirect,
  redirect as nextRedirect
} from 'next/navigation';
import React, {ComponentProps} from 'react';
import {
  receiveRoutingConfig,
  ResolvedRoutingConfig,
  RoutingConfigLocalizedNavigation,
  RoutingConfigSharedNavigation
} from '../../routing/config';
import {DomainConfig, Locales, Pathnames} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import {isLocalizableHref} from '../../shared/utils';
import BaseLink from './BaseLink';
import {
  HrefOrHrefWithParams,
  HrefOrUrlObjectWithParams,
  QueryParams,
  applyPathnamePrefix,
  compileLocalizedPathname,
  normalizeNameOrNameWithParams,
  serializeSearchParams,
  validateReceivedConfig
} from './utils';

/**
 * Shared implementations for `react-server` and `react-client`
 */
export default function createSharedNavigationFns<
  const AppLocales extends Locales,
  const AppPathnames extends Pathnames<AppLocales> = never
>(
  getLocale: () => AppLocales extends never ? string : AppLocales[number],
  routing?: [AppPathnames] extends [never]
    ? RoutingConfigSharedNavigation<AppLocales> | undefined
    : RoutingConfigLocalizedNavigation<AppLocales, AppPathnames>
) {
  type Locale = ReturnType<typeof getLocale>;

  const config = receiveRoutingConfig(
    routing || {}
  ) as typeof routing extends undefined
    ? Pick<ResolvedRoutingConfig<AppLocales>, 'localePrefix'>
    : [AppPathnames] extends [never]
      ? ResolvedRoutingConfig<AppLocales>
      : ResolvedRoutingConfig<AppLocales, AppPathnames>;
  if (process.env.NODE_ENV !== 'production') {
    validateReceivedConfig(config);
  }

  const pathnames = (config as any).pathnames as [AppPathnames] extends [never]
    ? undefined
    : AppPathnames;

  // This combination requires that the current host is known in order to
  // compute a correct pathname. Since that can only be achieved by reading from
  // headers, this would break static rendering. Therefore, as a workaround we
  // always add a prefix in this case to be on the safe side. The downside is
  // that the user might get redirected again if the middleware detects that the
  // prefix is not needed.
  const forcePrefixSsr =
    (config.localePrefix.mode === 'as-needed' && 'domains' in config) ||
    undefined;

  type LinkProps<Pathname extends keyof AppPathnames = never> = Omit<
    ComponentProps<typeof BaseLink>,
    'href' | 'localePrefix'
  > & {
    href: [AppPathnames] extends [never]
      ? ComponentProps<typeof BaseLink>['href']
      : HrefOrUrlObjectWithParams<Pathname>;
    locale?: Locale;
  };
  function Link<Pathname extends keyof AppPathnames = never>({
    href,
    locale,
    ...rest
  }: LinkProps<Pathname>) {
    let pathname, params;
    if (typeof href === 'object') {
      pathname = href.pathname;
      // @ts-expect-error -- This is ok
      params = href.params;
    } else {
      pathname = href;
    }

    // @ts-expect-error -- This is ok
    const isLocalizable = isLocalizableHref(href);

    const curLocale = getLocale();
    const finalPathname = isLocalizable
      ? getPathname(
          {
            locale: locale || curLocale,
            // @ts-expect-error -- This is ok
            href: pathnames == null ? pathname : {pathname, params}
          },
          locale != null || forcePrefixSsr || undefined
        )
      : pathname;

    return (
      <BaseLink
        href={{
          ...(typeof href === 'object' && href),
          // @ts-expect-error -- This is ok
          pathname: finalPathname
        }}
        locale={locale}
        // Provide the minimal relevant information to the client side in order
        // to potentially remove the prefix in case of the `forcePrefixSsr` case
        unprefixConfig={
          forcePrefixSsr && isLocalizable
            ? {
                domains: (config as any).domains.reduce(
                  (
                    acc: Record<Locale, string>,
                    domain: DomainConfig<AppLocales>
                  ) => {
                    // @ts-expect-error -- This is ok
                    acc[domain.defaultLocale] = domain.domain;
                    return acc;
                  },
                  {}
                ),
                pathname: getPathname(
                  {
                    locale: curLocale,
                    // @ts-expect-error -- This is ok
                    href: pathnames == null ? pathname : {pathname, params}
                  },
                  false
                )
              }
            : undefined
        }
        {...rest}
      />
    );
  }

  function getPathname(
    {
      domain,
      href,
      locale
    }: {
      locale: Locale;
      href: [AppPathnames] extends [never]
        ? string | {pathname: string; query?: QueryParams}
        : HrefOrHrefWithParams<keyof AppPathnames>;
      /** In case you're using `localePrefix: 'as-needed'` in combination with `domains`, the `defaultLocale` can differ by domain and therefore the locales that need to be prefixed can differ as well. For this particular case, this parameter should be provided in order to compute the correct pathname. Note that the actual domain is not part of the result, but only the pathname is returned. */
      domain?: string;
    },
    /** @private */
    _forcePrefix?: boolean
  ) {
    let pathname: string;
    if (pathnames == null) {
      if (typeof href === 'object') {
        pathname = href.pathname as string;
        if (href.query) {
          pathname += serializeSearchParams(href.query);
        }
      } else {
        pathname = href as string;
      }
    } else {
      pathname = compileLocalizedPathname({
        locale,
        // @ts-expect-error -- This is ok
        ...normalizeNameOrNameWithParams(href),
        // @ts-expect-error -- This is ok
        pathnames: config.pathnames
      });
    }

    // TODO: There might be only one shot here, for as-needed
    // would be reading `host`, but that breaks SSG. If you want
    // to get the first shot right, pass a `domain` here (then
    // the user opts into dynamic rendering)
    return applyPathnamePrefix(pathname, locale, config, domain, _forcePrefix);
  }

  function getRedirectFn(
    fn: typeof nextRedirect | typeof nextPermanentRedirect
  ) {
    return function redirectFn(
      href: Parameters<typeof getPathname>[0]['href'],
      ...args: ParametersExceptFirst<typeof nextRedirect>
    ) {
      const locale = getLocale();

      return fn(getPathname({href, locale}, forcePrefixSsr), ...args);
    };
  }

  const redirect = getRedirectFn(nextRedirect);
  const permanentRedirect = getRedirectFn(nextPermanentRedirect);

  return {
    Link,
    redirect,
    permanentRedirect,
    getPathname,
    config
  };
}
