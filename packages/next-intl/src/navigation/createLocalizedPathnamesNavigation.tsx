import React, {ComponentProps, ReactElement, forwardRef} from 'react';
import {
  useRouter as useBaseRouter,
  usePathname as useBasePathname
} from '../client';
import BaseLink from '../link';
import useLocale from '../react-client/useLocale';
import baseRedirect from '../server/react-client/redirect';
import {AllLocales, ParametersExceptFirst, Pathnames} from '../shared/types';
import {
  compileLocalizedPathname,
  getRoute,
  normalizeNameOrNameWithParams,
  HrefOrHrefWithParams,
  HrefOrUrlObjectWithParams
} from './utils';

export type LocalizedPathnamesLinkProps<
  Locales extends AllLocales,
  Pathname extends keyof Pathnames<Locales>
> = Omit<
  ComponentProps<typeof BaseLink>,
  'href' | 'name'
> & {
  href: HrefOrUrlObjectWithParams<Pathname>;
  locale?: Locales[number];
};

export default function createLocalizedPathnamesNavigation<
  Locales extends AllLocales,
  PathnamesConfig extends Pathnames<Locales>
>({locales, pathnames}: {locales: Locales; pathnames: PathnamesConfig}) {
  function useTypedLocale() {
    return useLocale() as (typeof locales)[number];
  }

  type LinkProps<Pathname extends keyof PathnamesConfig> = Omit<
    ComponentProps<typeof BaseLink>,
    'href' | 'name'
  > & {
    href: HrefOrUrlObjectWithParams<Pathname>;
    locale?: Locales[number];
  };
  function Link<Pathname extends keyof PathnamesConfig>(
    {href, locale, ...rest}: LinkProps<Pathname>,
    ref?: ComponentProps<typeof BaseLink>['ref']
  ) {
    const defaultLocale = useTypedLocale();
    const finalLocale = locale || defaultLocale;

    return (
      <BaseLink
        ref={ref}
        href={compileLocalizedPathname<Locales, Pathname>({
          locale: finalLocale,
          // @ts-expect-error -- This is ok
          pathname: href,
          // @ts-expect-error -- This is ok
          params: typeof href === 'object' ? href.params : undefined,
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
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since `redirect` should be called during render
    const locale = useTypedLocale();
    const resolvedHref = compileLocalizedPathname<Locales, Pathname>({
      ...normalizeNameOrNameWithParams(href),
      locale,
      pathnames
    });
    return baseRedirect(resolvedHref, ...args);
  }

  function useRouter() {
    const baseRouter = useBaseRouter();
    const defaultLocale = useTypedLocale();

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
    const locale = useTypedLocale();
    return getRoute({pathname, locale, pathnames});
  }

  return {Link: LinkWithRef, redirect, usePathname, useRouter};
}