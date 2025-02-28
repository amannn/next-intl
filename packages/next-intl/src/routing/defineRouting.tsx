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
  if (process.env.NODE_ENV !== 'production' && config.domains) {
    validateUniqueLocalesPerDomain(config.domains);
  }
  return config;
}

function validateUniqueLocalesPerDomain<
  AppLocales extends Locales,
  AppDomains extends DomainsConfig<AppLocales>
>(domains: AppDomains) {
  const domainsByLocale = new Map<string, Set<string>>();

  for (const {domain, locales} of domains) {
    for (const locale of locales) {
      const localeDomains = domainsByLocale.get(locale) || new Set<string>();
      localeDomains.add(domain);
      domainsByLocale.set(locale, localeDomains);
    }
  }

  const duplicateLocaleMessages = Array.from(domainsByLocale.entries())
    .filter(([, localeDomains]) => localeDomains.size > 1)
    .map(
      ([locale, localeDomains]) =>
        `- "${locale}" is used by: ${Array.from(localeDomains).join(', ')}`
    );

  if (duplicateLocaleMessages.length > 0) {
    console.warn(
      'Locales are expected to be unique per domain, but found overlap:\n' +
        duplicateLocaleMessages.join('\n') +
        '\nPlease see https://next-intl.dev/docs/routing#domains'
    );
  }
}
