import React, {ComponentProps, forwardRef} from 'react';
import {
  useRouter as useBaseRouter,
  usePathname as useBasePathname
} from '../client';
import useClientLocale from '../client/useClientLocale';
import BaseLink from '../link';
import baseRedirect from '../server/react-client/redirect';
import {AllLocales, ParametersExceptFirst, Pathnames} from '../shared/types';
import {Params, compileNamedRoute, getNamedRoute} from './utils';

export default function createNamedNavigation<Locales extends AllLocales>({
  locales,
  pathnames
}: {
  locales: Locales;
  pathnames: Pathnames<Locales>;
}) {
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
        href: keyof Pathnames<Locales>;
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
          href={compileNamedRoute({
            locale: finalLocale,
            href,
            params,
            pathnames
          })}
          {...rest}
        />
      );
    }
  );
  Link.displayName = 'Link';

  type NameOrNameWithParams =
    | keyof Pathnames<Locales>
    | {
        href: keyof Pathnames<Locales>;
        params?: Params;
      };

  function normalizeNameOrNameWithParams(
    nameOrNameWithParams: NameOrNameWithParams
  ) {
    return typeof nameOrNameWithParams === 'string'
      ? {href: nameOrNameWithParams, params: undefined}
      : nameOrNameWithParams;
  }

  function redirect(
    nameOrNameWithParams: NameOrNameWithParams,
    ...args: ParametersExceptFirst<typeof baseRedirect>
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context conditionally is fine
    const locale = useLocale();
    const href = compileNamedRoute({
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
        nameOrNameWithParams: NameOrNameWithParams,
        ...args: ParametersExceptFirst<typeof baseRouter.push>
      ) {
        const href = compileNamedRoute({
          ...normalizeNameOrNameWithParams(nameOrNameWithParams),
          locale,
          pathnames
        });
        return baseRouter.push(href, ...args);
      },

      replace(
        nameOrNameWithParams: NameOrNameWithParams,
        ...args: ParametersExceptFirst<typeof baseRouter.replace>
      ) {
        const href = compileNamedRoute({
          ...normalizeNameOrNameWithParams(nameOrNameWithParams),
          locale,
          pathnames
        });
        return baseRouter.replace(href, ...args);
      },

      prefetch(
        nameOrNameWithParams: NameOrNameWithParams,
        ...args: ParametersExceptFirst<typeof baseRouter.prefetch>
      ) {
        const href = compileNamedRoute({
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
