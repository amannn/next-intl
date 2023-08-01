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
import StrictParams from './StrictParams';
import {compileLocalizedPathname, getNamedRoute} from './utils';

export default function createLocalizedPathnamesNavigation<
  Locales extends AllLocales
>({locales, pathnames}: {locales: Locales; pathnames: Pathnames<Locales>}) {
  function useLocale() {
    return useClientLocale() as (typeof locales)[number];
  }

  type LinkProps<Pathname extends keyof typeof pathnames> = Omit<
    ComponentProps<typeof BaseLink>,
    'href' | 'name'
  > & {
    href: HrefOrUrlObject<Pathname>;
    params?: StrictParams<Pathname>;
    locale?: Locales[number];
  };
  function Link<Pathname extends keyof typeof pathnames>(
    {href, locale, params, ...rest}: LinkProps<Pathname>,
    ref?: ComponentProps<typeof BaseLink>['ref']
  ) {
    const defaultLocale = useLocale();
    const finalLocale = locale || defaultLocale;

    return (
      <BaseLink
        ref={ref}
        href={compileLocalizedPathname<Locales>({
          locale: finalLocale,
          // @ts-expect-error -- No idea
          pathname: href,
          params,
          pathnames
        })}
        locale={locale}
        {...rest}
      />
    );
  }
  const LinkWithRef = forwardRef(Link) as <
    Pathname extends keyof typeof pathnames
  >(
    props: LinkProps<Pathname> & {ref?: ComponentProps<typeof BaseLink>['ref']}
  ) => ReactElement;
  (LinkWithRef as any).displayName = 'Link';

  type HrefOrHrefWithParams<Pathname extends keyof typeof pathnames> =
    | keyof Pathnames<Locales>
    | {
        pathname: keyof Pathnames<Locales>;
        params?: StrictParams<Pathname>;
      };

  function normalizeNameOrNameWithParams<
    Pathname extends keyof typeof pathnames
  >(nameOrNameWithParams: HrefOrHrefWithParams<Pathname>) {
    return typeof nameOrNameWithParams === 'string'
      ? {pathname: nameOrNameWithParams, params: undefined}
      : nameOrNameWithParams;
  }

  function redirect<Pathname extends keyof typeof pathnames>(
    nameOrNameWithParams: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof baseRedirect>
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context conditionally is fine
    const locale = useLocale();
    const href = compileLocalizedPathname({
      ...normalizeNameOrNameWithParams(nameOrNameWithParams),
      locale,
      pathnames
    });
    return baseRedirect(href, ...args);
  }

  function useRouter() {
    const baseRouter = useBaseRouter();
    const defaultLocale = useLocale();

    return {
      ...baseRouter,
      push<Pathname extends keyof typeof pathnames>(
        nameOrNameWithParams: HrefOrHrefWithParams<Pathname>,
        ...args: ParametersExceptFirst<typeof baseRouter.push>
      ) {
        const href = compileLocalizedPathname({
          ...normalizeNameOrNameWithParams(nameOrNameWithParams),
          locale: args[0]?.locale || defaultLocale,
          pathnames
        });
        return baseRouter.push(href, ...args);
      },

      replace<Pathname extends keyof typeof pathnames>(
        nameOrNameWithParams: HrefOrHrefWithParams<Pathname>,
        ...args: ParametersExceptFirst<typeof baseRouter.replace>
      ) {
        const href = compileLocalizedPathname({
          ...normalizeNameOrNameWithParams(nameOrNameWithParams),
          locale: args[0]?.locale || defaultLocale,
          pathnames
        });
        return baseRouter.replace(href, ...args);
      },

      prefetch<Pathname extends keyof typeof pathnames>(
        nameOrNameWithParams: HrefOrHrefWithParams<Pathname>,
        ...args: ParametersExceptFirst<typeof baseRouter.prefetch>
      ) {
        const href = compileLocalizedPathname({
          ...normalizeNameOrNameWithParams(nameOrNameWithParams),
          locale: args[0]?.locale || defaultLocale,
          pathnames
        });
        return baseRouter.prefetch(href, ...args);
      }
    };
  }

  function usePathname(): keyof typeof pathnames {
    const pathname = useBasePathname();
    const locale = useLocale();
    return getNamedRoute({pathname, locale, pathnames});
  }

  return {Link: LinkWithRef, redirect, usePathname, useRouter};
}
