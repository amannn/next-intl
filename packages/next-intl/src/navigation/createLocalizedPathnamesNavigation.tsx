import React, {ComponentProps, ReactElement, forwardRef} from 'react';
import {
  useRouter as useBaseRouter,
  usePathname as useBasePathname
} from '../client';
import useClientLocale from '../client/useClientLocale';
import BaseLink from '../link';
import baseRedirect from '../server/react-client/redirect';
import {
  AllLocales,
  HrefOrUrlObject,
  ParametersExceptFirst,
  Pathnames
} from '../shared/types';
import {
  compileLocalizedPathname,
  getRoute,
  normalizeNameOrNameWithParams,
  HrefOrHrefWithParams,
  LinkParams
} from './utils';

export default function createLocalizedPathnamesNavigation<
  Locales extends AllLocales,
  PathnamesConfig extends Pathnames<Locales>
>({locales, pathnames}: {locales: Locales; pathnames: PathnamesConfig}) {
  function useLocale() {
    return useClientLocale() as (typeof locales)[number];
  }

  type LinkProps<Pathname extends keyof PathnamesConfig> = Omit<
    ComponentProps<typeof BaseLink>,
    'href' | 'name'
  > & {
    href: HrefOrUrlObject<Pathname>;
    locale?: Locales[number];
  } & LinkParams<Pathname>;
  function Link<Pathname extends keyof PathnamesConfig>(
    {href, locale, ...rest}: LinkProps<Pathname>,
    ref?: ComponentProps<typeof BaseLink>['ref']
  ) {
    const defaultLocale = useLocale();
    const finalLocale = locale || defaultLocale;

    return (
      <BaseLink
        ref={ref}
        href={compileLocalizedPathname<Locales, Pathname>({
          locale: finalLocale,
          // @ts-expect-error -- No idea
          pathname: href,
          // @ts-expect-error -- This is ok
          params: rest.params,
          pathnames
        })}
        locale={locale}
        {...rest}
      />
    );
  }
  const LinkWithRef = forwardRef(Link) as unknown as <
    Pathname extends keyof PathnamesConfig
  >(
    props: LinkProps<Pathname> & {ref?: ComponentProps<typeof BaseLink>['ref']}
  ) => ReactElement;
  (LinkWithRef as any).displayName = 'Link';

  function redirect<Pathname extends keyof PathnamesConfig>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof baseRedirect>
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context conditionally is fine
    const locale = useLocale();
    const resolvedHref = compileLocalizedPathname<Locales, Pathname>({
      ...normalizeNameOrNameWithParams(href),
      locale,
      pathnames
    });
    return baseRedirect(resolvedHref, ...args);
  }

  function useRouter() {
    const baseRouter = useBaseRouter();
    const defaultLocale = useLocale();

    return {
      ...baseRouter,
      push<Pathname extends keyof PathnamesConfig>(
        href: HrefOrHrefWithParams<Pathname>,
        ...args: ParametersExceptFirst<typeof baseRouter.push>
      ) {
        const resolvedHref = compileLocalizedPathname({
          ...normalizeNameOrNameWithParams(href),
          locale: args[0]?.locale || defaultLocale,
          pathnames
        });
        return baseRouter.push(resolvedHref, ...args);
      },

      replace<Pathname extends keyof PathnamesConfig>(
        href: HrefOrHrefWithParams<Pathname>,
        ...args: ParametersExceptFirst<typeof baseRouter.replace>
      ) {
        const resolvedHref = compileLocalizedPathname({
          ...normalizeNameOrNameWithParams(href),
          locale: args[0]?.locale || defaultLocale,
          pathnames
        });
        return baseRouter.replace(resolvedHref, ...args);
      },

      prefetch<Pathname extends keyof PathnamesConfig>(
        href: HrefOrHrefWithParams<Pathname>,
        ...args: ParametersExceptFirst<typeof baseRouter.prefetch>
      ) {
        const resolvedHref = compileLocalizedPathname({
          ...normalizeNameOrNameWithParams(href),
          locale: args[0]?.locale || defaultLocale,
          pathnames
        });
        return baseRouter.prefetch(resolvedHref, ...args);
      }
    };
  }

  function usePathname(): keyof PathnamesConfig {
    const pathname = useBasePathname();
    const locale = useLocale();
    return getRoute({pathname, locale, pathnames});
  }

  return {Link: LinkWithRef, redirect, usePathname, useRouter};
}
