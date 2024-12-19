import type {
  RoutingConfigLocalizedNavigation,
  RoutingConfigSharedNavigation
} from '../../routing/config.tsx';
import type {
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../../routing/types.tsx';
import createSharedNavigationFns from '../shared/createSharedNavigationFns.tsx';
import getServerLocale from './getServerLocale.tsx';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {config, ...fns} = createSharedNavigationFns(getServerLocale, routing);

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
