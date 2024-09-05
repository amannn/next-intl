import React, {ComponentProps, forwardRef, ReactElement, useMemo} from 'react';
import useLocale from '../../react-client/useLocale';
import {
  RoutingConfigLocalizedNavigation,
  RoutingConfigSharedNavigation
} from '../../routing/config';
import {Locales, Pathnames} from '../../routing/types';
import createSharedNavigationFns from '../shared/createSharedNavigationFns';
import {getRoute} from '../shared/utils';
import useBasePathname from './useBasePathname';

export default function createNavigation<
  const AppLocales extends Locales,
  const AppPathnames extends Pathnames<AppLocales> = never
>(
  routing?: [AppPathnames] extends [never]
    ? RoutingConfigSharedNavigation<AppLocales> | undefined
    : RoutingConfigLocalizedNavigation<AppLocales, AppPathnames>
) {
  type Locale = AppLocales extends never ? string : AppLocales[number];

  function getLocale() {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since this must always be called during render (redirect, useRouter)
    return useLocale() as Locale;
  }

  const {
    Link: BaseLink,
    config,
    ...fns
  } = createSharedNavigationFns(getLocale, routing);

  /**
   * Returns the pathname without a potential locale prefix.
   *
   * @see https://next-intl-docs.vercel.app/docs/routing/navigation#usepathname
   */
  function usePathname(): [AppPathnames] extends [never]
    ? string
    : keyof AppPathnames {
    const pathname = useBasePathname(config.localePrefix);
    const locale = getLocale();

    // @ts-expect-error -- Mirror the behavior from Next.js, where `null` is returned when `usePathname` is used outside of Next, but the types indicate that a string is always returned.
    return useMemo(
      () =>
        pathname &&
        // @ts-expect-error -- This is fine
        config.pathnames
          ? getRoute(
              locale,
              pathname,
              // @ts-expect-error -- This is fine
              config.pathnames
            )
          : pathname,
      [locale, pathname]
    );
  }

  type LinkProps = Omit<ComponentProps<typeof BaseLink>, 'nodeRef'>;
  function Link(props: LinkProps, ref: LinkProps['ref']) {
    return <BaseLink nodeRef={ref} {...props} />;
  }
  const LinkWithRef = forwardRef(Link) as (
    props: LinkProps & {ref?: LinkProps['ref']}
  ) => ReactElement;
  (LinkWithRef as any).displayName = 'Link';

  // TODO
  function useRouter() {}

  return {...fns, Link: LinkWithRef, usePathname, useRouter};
}
