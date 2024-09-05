import {useMemo} from 'react';
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
    let locale;
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since `redirect` must be called during render
      locale = useLocale();
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(
          '`redirect()` and `permanentRedirect()` can only be called during render. To redirect in an event handler or similar, you can use `useRouter()` instead.'
        );
      }
      throw e;
    }
    return locale as Locale;
  }

  const {config, ...fns} = createSharedNavigationFns(getLocale, routing);

  /**
   * Returns the pathname without a potential locale prefix.
   *
   * @see https://next-intl-docs.vercel.app/docs/routing/navigation#usepathname
   */
  function usePathname(): string {
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

  // TODO
  function useRouter() {}

  return {...fns, usePathname, useRouter};
}
