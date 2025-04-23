import {
  permanentRedirect as nextPermanentRedirect,
  redirect as nextRedirect
} from 'next/navigation.js';
import {type ComponentProps, forwardRef} from 'react';
import type {Locale} from 'use-intl';
import {
  type RoutingConfigLocalizedNavigation,
  type RoutingConfigSharedNavigation,
  receiveRoutingConfig
} from '../../routing/config.js';
import type {
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../../routing/types.js';
import type {ParametersExceptFirst, Prettify} from '../../shared/types.js';
import use from '../../shared/use.js';
import {isLocalizableHref, isPromise} from '../../shared/utils.js';
import BaseLink from './BaseLink.js';
import {
  type HrefOrHrefWithParams,
  type HrefOrUrlObjectWithParams,
  type QueryParams,
  applyPathnamePrefix,
  compileLocalizedPathname,
  normalizeNameOrNameWithParams,
  serializeSearchParams,
  validateReceivedConfig
} from './utils.js';

type PromiseOrValue<Type> = Type | Promise<Type>;

/**
 * Shared implementations for `react-server` and `react-client`
 */
export default function createSharedNavigationFns<
  const AppLocales extends Locales,
  const AppPathnames extends Pathnames<AppLocales> = never,
  const AppLocalePrefixMode extends LocalePrefixMode = 'always',
  const AppDomains extends DomainsConfig<AppLocales> = never
>(
  getLocale: () => PromiseOrValue<Locale>,
  routing?: [AppPathnames] extends [never]
    ?
        | RoutingConfigSharedNavigation<
            AppLocales,
            AppLocalePrefixMode,
            AppDomains
          >
        | undefined
    : RoutingConfigLocalizedNavigation<
        AppLocales,
        AppLocalePrefixMode,
        AppPathnames,
        AppDomains
      >
) {
  const config = receiveRoutingConfig(routing || {});
  if (process.env.NODE_ENV !== 'production') {
    validateReceivedConfig(config);
  }

  const pathnames = (config as any).pathnames as [AppPathnames] extends [never]
    ? undefined
    : AppPathnames;

  type LinkProps<Pathname extends keyof AppPathnames = never> = Prettify<
    Omit<
      ComponentProps<typeof BaseLink>,
      'href' | 'localePrefix' | 'unprefixed' | 'defaultLocale' | 'localeCookie'
    > & {
      /** @see https://next-intl.dev/docs/routing/navigation#link */
      href: [AppPathnames] extends [never]
        ? ComponentProps<typeof BaseLink>['href']
        : HrefOrUrlObjectWithParams<Pathname>;
      /** @see https://next-intl.dev/docs/routing/navigation#link */
      locale?: Locale;
    }
  >;
  function Link<Pathname extends keyof AppPathnames = never>(
    {href, locale, ...rest}: LinkProps<Pathname>,
    ref: ComponentProps<typeof BaseLink>['ref']
  ) {
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

    const localePromiseOrValue = getLocale();
    const curLocale = isPromise(localePromiseOrValue)
      ? use(localePromiseOrValue)
      : localePromiseOrValue;

    const finalPathname = isLocalizable
      ? getPathname({
          locale: locale || curLocale,
          // @ts-expect-error -- This is ok
          href: pathnames == null ? pathname : {pathname, params},
          forcePrefix: locale != null || undefined
        })
      : pathname;

    return (
      <BaseLink
        ref={ref}
        // @ts-expect-error -- This is ok
        href={
          typeof href === 'object'
            ? {...href, pathname: finalPathname}
            : finalPathname
        }
        locale={locale}
        localeCookie={config.localeCookie}
        {...rest}
      />
    );
  }
  const LinkWithRef = forwardRef(Link);

  function getPathname(args: {
    /** @see https://next-intl.dev/docs/routing/navigation#getpathname */
    href: [AppPathnames] extends [never]
      ? string | {pathname: string; query?: QueryParams}
      : HrefOrHrefWithParams<keyof AppPathnames>;
    /** The locale to compute the pathname for. */
    locale: Locale;
    /** Will prepend the pathname with the locale prefix, regardless of your `localePrefix` setting. This can be helpful to update a locale cookie when changing locales. */
    forcePrefix?: boolean;
  }) {
    const {forcePrefix, href, locale} = args;

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

    return applyPathnamePrefix(pathname, locale, config, forcePrefix);
  }

  function getRedirectFn(
    fn: typeof nextRedirect | typeof nextPermanentRedirect
  ) {
    /** @see https://next-intl.dev/docs/routing/navigation#redirect */
    return function redirectFn(
      args: Omit<Parameters<typeof getPathname>[0], 'domain'>,
      ...rest: ParametersExceptFirst<typeof nextRedirect>
    ) {
      return fn(getPathname(args), ...rest);
    };
  }

  const redirect = getRedirectFn(nextRedirect);
  const permanentRedirect = getRedirectFn(nextPermanentRedirect);

  return {
    config,
    Link: LinkWithRef,
    redirect,
    permanentRedirect,
    getPathname
  };
}
