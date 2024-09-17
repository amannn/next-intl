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
import {Locales, Pathnames} from '../../routing/types';
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

    const curLocale = getLocale();

    // @ts-expect-error -- This is ok
    const finalPathname = isLocalizableHref(href)
      ? getPathname(
          {
            locale: locale || curLocale,
            // @ts-expect-error -- This is ok
            href: pathnames == null ? pathname : {pathname, params}
          },
          locale != null
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
        {...rest}
      />
    );
  }

  // New: getPathname is available for shared pathnames
  function getPathname(
    {
      href,
      locale
    }: {
      locale: Locale;
      href: [AppPathnames] extends [never]
        ? string | {pathname: string; query?: QueryParams}
        : HrefOrHrefWithParams<keyof AppPathnames>;
    },
    /** @private */
    _forcePrefix?: boolean
    // TODO: Should we somehow ensure this doesn't get emitted to the types?
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
    return applyPathnamePrefix({
      pathname,
      locale,
      routing: config,
      force: _forcePrefix
    });
  }

  function getRedirectFn(
    fn: typeof nextRedirect | typeof nextPermanentRedirect
  ) {
    return function redirectFn(
      href: Parameters<typeof getPathname>[0]['href'],
      ...args: ParametersExceptFirst<typeof nextRedirect>
    ) {
      const locale = getLocale();
      return fn(getPathname({href, locale}), ...args);
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
