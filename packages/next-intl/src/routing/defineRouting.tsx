import type {RoutingConfig} from './config.js';
import type {
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from './types.js';

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
  return config;
}
