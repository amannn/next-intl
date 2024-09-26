export type Locales = ReadonlyArray<string>;

export type LocalePrefixMode = 'always' | 'as-needed' | 'never';

type Pathname = string;

export type LocalePrefixes<AppLocales extends Locales> = Partial<
  Record<AppLocales[number], Pathname>
>;

export type LocalePrefixConfigVerbose<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode
> = AppLocalePrefixMode extends 'always'
  ? {
      mode: 'always';
      prefixes?: LocalePrefixes<AppLocales>;
    }
  : AppLocalePrefixMode extends 'as-needed'
    ? {
        mode: 'as-needed';
        prefixes?: LocalePrefixes<AppLocales>;
      }
    : {
        mode: 'never';
      };

export type LocalePrefix<
  AppLocales extends Locales = [],
  AppLocalePrefixMode extends LocalePrefixMode = 'always'
> =
  | AppLocalePrefixMode
  | LocalePrefixConfigVerbose<AppLocales, AppLocalePrefixMode>;

export type Pathnames<AppLocales extends Locales> = Record<
  Pathname,
  Record<AppLocales[number], Pathname> | Pathname
>;

export type DomainConfig<AppLocales extends Locales> = {
  /* Used by default if none of the defined locales match. */
  defaultLocale: AppLocales[number];

  /** The domain name (e.g. "example.com", "www.example.com" or "fr.example.com"). Note that the `x-forwarded-host` or alternatively the `host` header will be used to determine the requested domain. */
  domain: string;

  /** Optionally restrict which locales are available on this domain. */
  locales?: Array<AppLocales[number]>;
};

export type DomainsConfig<AppLocales extends Locales> = Array<
  DomainConfig<AppLocales>
>;
