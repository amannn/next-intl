import useLocale from '../../react-client/useLocale';
import {
  RoutingConfigLocalizedNavigation,
  RoutingConfigSharedNavigation
} from '../../routing/config';
import {Locales, Pathnames} from '../../routing/types';
import createSharedNavigationFns from '../shared/createSharedNavigationFns';

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

  const fns = createSharedNavigationFns(getLocale, routing);

  return fns;
}
