import React, {ComponentProps, forwardRef} from 'react';
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
import {Params, compileLocalizedPathname, getNamedRoute} from './utils';

export default function createLocalizedPathnamesNavigation<
  Locales extends AllLocales
>({locales, pathnames}: {locales: Locales; pathnames: Pathnames<Locales>}) {
  function useLocale() {
    return useClientLocale() as (typeof locales)[number];
  }

  const Link = forwardRef(
    (
      {
        href,
        locale,
        params,
        ...rest
      }: Omit<ComponentProps<typeof BaseLink>, 'href' | 'name'> & {
        href: HrefOrUrlObject<keyof typeof pathnames>;
        params?: Params;
        locale?: Locales[number];
      },
      ref: ComponentProps<typeof BaseLink>['ref']
    ) => {
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
  );
  Link.displayName = 'Link';

  type HrefOrHrefWithParams =
    | keyof Pathnames<Locales>
    | {
        pathname: keyof Pathnames<Locales>;
        params?: Params;
      };

  function normalizeNameOrNameWithParams(
    nameOrNameWithParams: HrefOrHrefWithParams
  ) {
    return typeof nameOrNameWithParams === 'string'
      ? {pathname: nameOrNameWithParams, params: undefined}
      : nameOrNameWithParams;
  }

  function redirect(
    nameOrNameWithParams: HrefOrHrefWithParams,
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
    const locale = useLocale();

    return {
      ...baseRouter,
      push(
        nameOrNameWithParams: HrefOrHrefWithParams,
        ...args: ParametersExceptFirst<typeof baseRouter.push>
      ) {
        const href = compileLocalizedPathname({
          ...normalizeNameOrNameWithParams(nameOrNameWithParams),
          locale,
          pathnames
        });
        return baseRouter.push(href, ...args);
      },

      replace(
        nameOrNameWithParams: HrefOrHrefWithParams,
        ...args: ParametersExceptFirst<typeof baseRouter.replace>
      ) {
        const href = compileLocalizedPathname({
          ...normalizeNameOrNameWithParams(nameOrNameWithParams),
          locale,
          pathnames
        });
        return baseRouter.replace(href, ...args);
      },

      prefetch(
        nameOrNameWithParams: HrefOrHrefWithParams,
        ...args: ParametersExceptFirst<typeof baseRouter.prefetch>
      ) {
        const href = compileLocalizedPathname({
          ...normalizeNameOrNameWithParams(nameOrNameWithParams),
          locale,
          pathnames
        });
        return baseRouter.prefetch(href, ...args);
      }
    };
  }

  function usePathname() {
    const pathname = useBasePathname();
    const locale = useLocale();
    return getNamedRoute({pathname, locale, pathnames});
  }

  return {Link, redirect, usePathname, useRouter};
}
