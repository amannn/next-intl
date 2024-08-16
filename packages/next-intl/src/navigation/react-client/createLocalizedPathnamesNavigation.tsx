import React, {ComponentProps, ReactElement, forwardRef, useMemo} from 'react';
import useLocale from '../../react-client/useLocale';
import {Locales, Pathnames} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import {
  LocalizedNavigationRoutingConfigInput,
  receiveLocalizedNavigationRoutingConfig
} from '../shared/config';
import {
  compileLocalizedPathname,
  getRoute,
  normalizeNameOrNameWithParams,
  HrefOrHrefWithParams,
  HrefOrUrlObjectWithParams
} from '../shared/utils';
import ClientLink from './ClientLink';
import {clientRedirect, clientPermanentRedirect} from './redirects';
import useBasePathname from './useBasePathname';
import useBaseRouter from './useBaseRouter';

export default function createLocalizedPathnamesNavigation<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
>(input: LocalizedNavigationRoutingConfigInput<AppLocales, AppPathnames>) {
  const config = receiveLocalizedNavigationRoutingConfig(input);

  function useTypedLocale(): AppLocales[number] {
    const locale = useLocale();
    const isValid = config.locales.includes(locale as any);
    if (!isValid) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `Unknown locale encountered: "${locale}". Make sure to validate the locale in \`i18n.ts\`.`
          : undefined
      );
    }
    return locale;
  }

  type LinkProps<Pathname extends keyof AppPathnames> = Omit<
    ComponentProps<typeof ClientLink>,
    'href' | 'name' | 'localePrefix'
  > & {
    href: HrefOrUrlObjectWithParams<Pathname>;
    locale?: AppLocales[number];
  };
  function Link<Pathname extends keyof AppPathnames>(
    {href, locale, ...rest}: LinkProps<Pathname>,
    ref?: ComponentProps<typeof ClientLink>['ref']
  ) {
    const defaultLocale = useTypedLocale();
    const finalLocale = locale || defaultLocale;

    return (
      <ClientLink
        ref={ref}
        href={compileLocalizedPathname<AppLocales, Pathname>({
          locale: finalLocale,
          // @ts-expect-error -- This is ok
          pathname: href,
          // @ts-expect-error -- This is ok
          params: typeof href === 'object' ? href.params : undefined,
          pathnames: config.pathnames
        })}
        locale={locale}
        localePrefix={config.localePrefix}
        {...rest}
      />
    );
  }
  const LinkWithRef = forwardRef(Link) as unknown as <
    Pathname extends keyof AppPathnames
  >(
    props: LinkProps<Pathname> & {
      ref?: ComponentProps<typeof ClientLink>['ref'];
    }
  ) => ReactElement;
  (LinkWithRef as any).displayName = 'Link';

  function redirect<Pathname extends keyof AppPathnames>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof clientRedirect>
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since `redirect` should be called during render
    const locale = useTypedLocale();
    const resolvedHref = getPathname({href, locale});
    return clientRedirect(
      {pathname: resolvedHref, localePrefix: config.localePrefix},
      ...args
    );
  }

  function permanentRedirect<Pathname extends keyof AppPathnames>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof clientPermanentRedirect>
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since `redirect` should be called during render
    const locale = useTypedLocale();
    const resolvedHref = getPathname({href, locale});
    return clientPermanentRedirect(
      {pathname: resolvedHref, localePrefix: config.localePrefix},
      ...args
    );
  }

  function useRouter() {
    const baseRouter = useBaseRouter(config.localePrefix);
    const defaultLocale = useTypedLocale();

    return useMemo(
      () => ({
        ...baseRouter,
        push<Pathname extends keyof AppPathnames>(
          href: HrefOrHrefWithParams<Pathname>,
          ...args: ParametersExceptFirst<typeof baseRouter.push>
        ) {
          const resolvedHref = getPathname({
            href,
            locale: args[0]?.locale || defaultLocale
          });
          return baseRouter.push(resolvedHref, ...args);
        },

        replace<Pathname extends keyof AppPathnames>(
          href: HrefOrHrefWithParams<Pathname>,
          ...args: ParametersExceptFirst<typeof baseRouter.replace>
        ) {
          const resolvedHref = getPathname({
            href,
            locale: args[0]?.locale || defaultLocale
          });
          return baseRouter.replace(resolvedHref, ...args);
        },

        prefetch<Pathname extends keyof AppPathnames>(
          href: HrefOrHrefWithParams<Pathname>,
          ...args: ParametersExceptFirst<typeof baseRouter.prefetch>
        ) {
          const resolvedHref = getPathname({
            href,
            locale: args[0]?.locale || defaultLocale
          });
          return baseRouter.prefetch(resolvedHref, ...args);
        }
      }),
      [baseRouter, defaultLocale]
    );
  }

  function usePathname(): keyof AppPathnames {
    const pathname = useBasePathname(config.localePrefix);
    const locale = useTypedLocale();

    // @ts-expect-error -- Mirror the behavior from Next.js, where `null` is returned when `usePathname` is used outside of Next, but the types indicate that a string is always returned.
    return useMemo(
      () =>
        pathname ? getRoute(locale, pathname, config.pathnames) : pathname,
      [locale, pathname]
    );
  }

  function getPathname({
    href,
    locale
  }: {
    locale: AppLocales[number];
    href: HrefOrHrefWithParams<keyof AppPathnames>;
  }) {
    return compileLocalizedPathname({
      ...normalizeNameOrNameWithParams(href),
      locale,
      pathnames: config.pathnames
    });
  }

  return {
    Link: LinkWithRef,
    redirect,
    permanentRedirect,
    usePathname,
    useRouter,
    getPathname
  };
}
