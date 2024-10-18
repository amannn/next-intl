import {
  RoutingConfigLocalizedNavigation,
  RoutingConfigSharedNavigation
} from '../../routing/config';
import {
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../../routing/types';
import {getRequestLocale} from '../../server/react-server/RequestLocale';
import createSharedNavigationFns from '../shared/createSharedNavigationFns';

export default function createNavigation<
  const AppLocales extends Locales,
  const AppLocalePrefixMode extends LocalePrefixMode = 'always',
  const AppPathnames extends Pathnames<AppLocales> = never,
  const AppDomains extends DomainsConfig<AppLocales> = never
>(
  routing?: [AppPathnames] extends [never]
    ?
        | RoutingConfigSharedNavigation<
            AppLocales,
            AppLocalePrefixMode,
            AppDomains
          >
        | undefined
    : RoutingConfigLocalizedNavigation<
        AppLocales,
        AppLocalePrefixMode,
        AppPathnames,
        AppDomains
      >
) {
  type Locale = AppLocales extends never ? string : AppLocales[number];

  function getLocale() {
    return getRequestLocale() as Promise<Locale>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {config, ...fns} = createSharedNavigationFns(getLocale, routing);

  function notSupported(hookName: string) {
    return () => {
      throw new Error(
        `\`${hookName}\` is not supported in Server Components. You can use this hook if you convert the calling component to a Client Component.`
      );
    };
  }

  return {
    ...fns,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}
