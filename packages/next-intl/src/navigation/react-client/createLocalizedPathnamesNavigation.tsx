import React, {ComponentProps, ReactElement, forwardRef} from 'react';
import useLocale from '../../react-client/useLocale';
import {
  AllLocales,
  LocalePrefixConfig,
  ParametersExceptFirst,
  Pathnames
} from '../../shared/types';
import {receiveLocalePrefixConfig} from '../../shared/utils';
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
  Locales extends AllLocales,
  PathnamesConfig extends Pathnames<Locales>
>(opts: {
  locales: Locales;
  pathnames: PathnamesConfig;
  localePrefix?: LocalePrefixConfig<Locales>;
}) {
  const finalLocalePrefix = receiveLocalePrefixConfig(opts?.localePrefix);

  function useTypedLocale(): Locales[number] {
    const locale = useLocale();
    const isValid = opts.locales.includes(locale as any);
    if (!isValid) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `Unknown locale encountered: "${locale}". Make sure to validate the locale in \`i18n.ts\`.`
          : undefined
      );
    }
    return locale;
  }

  type LinkProps<Pathname extends keyof PathnamesConfig> = Omit<
    ComponentProps<typeof ClientLink>,
    'href' | 'name' | 'localePrefix'
  > & {
    href: HrefOrUrlObjectWithParams<Pathname>;
    locale?: Locales[number];
  };
  function Link<Pathname extends keyof PathnamesConfig>(
    {href, locale, ...rest}: LinkProps<Pathname>,
    ref?: ComponentProps<typeof ClientLink>['ref']
  ) {
    const defaultLocale = useTypedLocale();
    const finalLocale = locale || defaultLocale;

    return (
      <ClientLink
        ref={ref}
        href={compileLocalizedPathname<Locales, Pathname>({
          locale: finalLocale,
          // @ts-expect-error -- This is ok
          pathname: href,
          // @ts-expect-error -- This is ok
          params: typeof href === 'object' ? href.params : undefined,
          pathnames: opts.pathnames
        })}
        locale={locale}
        localePrefix={finalLocalePrefix}
        {...rest}
      />
    );
  }
  const LinkWithRef = forwardRef(Link) as unknown as <
    Pathname extends keyof PathnamesConfig
  >(
    props: LinkProps<Pathname> & {
      ref?: ComponentProps<typeof ClientLink>['ref'];
    }
  ) => ReactElement;
  (LinkWithRef as any).displayName = 'Link';

  function redirect<Pathname extends keyof PathnamesConfig>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof clientRedirect>
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since `redirect` should be called during render
    const locale = useTypedLocale();
    const resolvedHref = getPathname({href, locale});
    return clientRedirect(
      {pathname: resolvedHref, localePrefix: finalLocalePrefix},
      ...args
    );
  }

  function permanentRedirect<Pathname extends keyof PathnamesConfig>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof clientPermanentRedirect>
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since `redirect` should be called during render
    const locale = useTypedLocale();
    const resolvedHref = getPathname({href, locale});
    return clientPermanentRedirect(
      {pathname: resolvedHref, localePrefix: finalLocalePrefix},
      ...args
    );
  }

  function useRouter() {
    const baseRouter = useBaseRouter(finalLocalePrefix);
    const defaultLocale = useTypedLocale();

    return {
      ...baseRouter,
      push<Pathname extends keyof PathnamesConfig>(
        href: HrefOrHrefWithParams<Pathname>,
        ...args: ParametersExceptFirst<typeof baseRouter.push>
      ) {
        const resolvedHref = getPathname({
          href,
          locale: args[0]?.locale || defaultLocale
        });
        return baseRouter.push(resolvedHref, ...args);
      },

      replace<Pathname extends keyof PathnamesConfig>(
        href: HrefOrHrefWithParams<Pathname>,
        ...args: ParametersExceptFirst<typeof baseRouter.replace>
      ) {
        const resolvedHref = getPathname({
          href,
          locale: args[0]?.locale || defaultLocale
        });
        return baseRouter.replace(resolvedHref, ...args);
      },

      prefetch<Pathname extends keyof PathnamesConfig>(
        href: HrefOrHrefWithParams<Pathname>,
        ...args: ParametersExceptFirst<typeof baseRouter.prefetch>
      ) {
        const resolvedHref = getPathname({
          href,
          locale: args[0]?.locale || defaultLocale
        });
        return baseRouter.prefetch(resolvedHref, ...args);
      }
    };
  }

  function usePathname(): keyof PathnamesConfig {
    const pathname = useBasePathname();
    const locale = useTypedLocale();
    // @ts-expect-error -- Mirror the behavior from Next.js, where `null` is returned when `usePathname` is used outside of Next, but the types indicate that a string is always returned.
    return pathname
      ? getRoute({pathname, locale, pathnames: opts.pathnames})
      : pathname;
  }

  function getPathname({
    href,
    locale
  }: {
    locale: Locales[number];
    href: HrefOrHrefWithParams<keyof PathnamesConfig>;
  }) {
    return compileLocalizedPathname({
      ...normalizeNameOrNameWithParams(href),
      locale,
      pathnames: opts.pathnames
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
