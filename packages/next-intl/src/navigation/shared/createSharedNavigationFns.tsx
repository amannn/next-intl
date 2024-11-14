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
} from '../../routing/config.tsx';
import type {
  DomainConfig,
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../../routing/types.tsx';
import type {ParametersExceptFirst, Prettify} from '../../shared/types.tsx';
import use from '../../shared/use.tsx';
import {isLocalizableHref} from '../../shared/utils.tsx';
import BaseLink from './BaseLink.tsx';
import {
  type HrefOrHrefWithParams,
  type HrefOrUrlObjectWithParams,
  type QueryParams,
  applyPathnamePrefix,
  compileLocalizedPathname,
  normalizeNameOrNameWithParams,
  serializeSearchParams,
  validateReceivedConfig
} from './utils.tsx';

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

  // This combination requires that the current host is known in order to
  // compute a correct pathname. Since that can only be achieved by reading from
  // headers, this would break static rendering. Therefore, as a workaround we
  // always add a prefix in this case to be on the safe side. The downside is
  // that the user might get redirected again if the middleware detects that the
  // prefix is not needed.
  const forcePrefixSsr =
    (config.localePrefix.mode === 'as-needed' && (config as any).domains) ||
    undefined;

  type LinkProps<Pathname extends keyof AppPathnames = never> = Prettify<
    Omit<
      ComponentProps<typeof BaseLink>,
      'href' | 'localePrefix' | 'unprefixed' | 'defaultLocale' | 'localeCookie'
    > & {
      /** @see https://next-intl-docs.vercel.app/docs/routing/navigation#link */
      href: [AppPathnames] extends [never]
        ? ComponentProps<typeof BaseLink>['href']
        : HrefOrUrlObjectWithParams<Pathname>;
      /** @see https://next-intl-docs.vercel.app/docs/routing/navigation#link */
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
    const curLocale =
      localePromiseOrValue instanceof Promise
        ? use(localePromiseOrValue)
        : localePromiseOrValue;

    const finalPathname = isLocalizable
      ? getPathname(
          // @ts-expect-error -- This is ok
          {
            locale: locale || curLocale,
            href: pathnames == null ? pathname : {pathname, params}
          },
          locale != null || forcePrefixSsr || undefined
        )
      : pathname;

    return (
      <BaseLink
        ref={ref}
        // @ts-expect-error -- Available after the validation
        defaultLocale={config.defaultLocale}
        // @ts-expect-error -- This is ok
        href={
          typeof href === 'object'
            ? {...href, pathname: finalPathname}
            : finalPathname
        }
        locale={locale}
        localeCookie={config.localeCookie}
        // Provide the minimal relevant information to the client side in order
        // to potentially remove the prefix in case of the `forcePrefixSsr` case
        unprefixed={
          forcePrefixSsr && isLocalizable
            ? {
                domains: (config as any).domains.reduce(
                  (
                    acc: Record<string, Locale>,
                    domain: DomainConfig<AppLocales>
                  ) => {
                    acc[domain.domain] = domain.defaultLocale;
                    return acc;
                  },
                  {}
                ),
                pathname: getPathname(
                  // @ts-expect-error -- This is ok
                  {
                    locale: curLocale,
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
  const LinkWithRef = forwardRef(Link);

  type DomainConfigForAsNeeded = typeof routing extends undefined
    ? {}
    : AppLocalePrefixMode extends 'as-needed'
      ? [AppDomains] extends [never]
        ? {}
        : {
            /**
             * In case you're using `localePrefix: 'as-needed'` in combination with `domains`, the `defaultLocale` can differ by domain and therefore the locales that need to be prefixed can differ as well. For this particular case, this parameter should be provided in order to compute the correct pathname. Note that the actual domain is not part of the result, but only the pathname is returned.
             * @see https://next-intl-docs.vercel.app/docs/routing/navigation#getpathname
             */
            domain: AppDomains[number]['domain'];
          }
      : {};

  function getPathname(
    args: {
      /** @see https://next-intl-docs.vercel.app/docs/routing/navigation#getpathname */
      href: [AppPathnames] extends [never]
        ? string | {pathname: string; query?: QueryParams}
        : HrefOrHrefWithParams<keyof AppPathnames>;
      locale: Locale;
    } & DomainConfigForAsNeeded,
    /** @private Removed in types returned below */
    _forcePrefix?: boolean
  ) {
    const {href, locale} = args;

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

    return applyPathnamePrefix(
      pathname,
      locale,
      config,
      // @ts-expect-error -- This is ok
      args.domain,
      _forcePrefix
    );
  }

  function getRedirectFn(
    fn: typeof nextRedirect | typeof nextPermanentRedirect
  ) {
    /** @see https://next-intl-docs.vercel.app/docs/routing/navigation#redirect */
    return function redirectFn(
      args: Omit<Parameters<typeof getPathname>[0], 'domain'> &
        Partial<DomainConfigForAsNeeded>,
      ...rest: ParametersExceptFirst<typeof nextRedirect>
    ) {
      return fn(
        // @ts-expect-error -- We're forcing the prefix when no domain is provided
        getPathname(args, args.domain ? undefined : forcePrefixSsr),
        ...rest
      );
    };
  }

  const redirect = getRedirectFn(nextRedirect);
  const permanentRedirect = getRedirectFn(nextPermanentRedirect);

  return {
    config,
    Link: LinkWithRef,
    redirect,
    permanentRedirect,

    // Remove `_forcePrefix` from public API
    getPathname: getPathname as (
      args: Parameters<typeof getPathname>[0]
    ) => string
  };
}
