import type {RoutingConfig} from './config.tsx';
import type {
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from './types.tsx';
import validateLocales from './validateLocales.tsx';

export default function defineRouting<
  const AppLocales extends Locales,
  const AppLocalePrefixMode extends LocalePrefixMode = 'always',
  const AppPathnames extends Pathnames<AppLocales> = never,
  const AppDomains extends DomainsConfig<AppLocales> = never
>(
  config: RoutingConfig<
    AppLocales,
    AppLocalePrefixMode,
    AppPathnames,
    AppDomains
  >
) {
  if (process.env.NODE_ENV !== 'production') {
    validateLocales(config.locales);
  }
  return config;
}
