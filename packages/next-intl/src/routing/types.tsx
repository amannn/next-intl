export type Locales = ReadonlyArray<string>;

export type LocalePrefixMode = 'always' | 'as-needed' | 'never';

export type LocalePrefixes<AppLocales extends Locales> = Partial<
  Record<AppLocales[number], string>
>;

export type LocalePrefixConfigVerbose<AppLocales extends Locales> =
  | {
      mode: 'always';
      prefixes?: LocalePrefixes<AppLocales>;
    }
  | {
      mode: 'as-needed';
      prefixes?: LocalePrefixes<AppLocales>;
    }
  | {
      mode: 'never';
    };

export type LocalePrefixConfig<AppLocales extends Locales> =
  | LocalePrefixMode
  | LocalePrefixConfigVerbose<AppLocales>;

export type Pathnames<AppLocales extends Locales> = Record<
  string,
  Record<AppLocales[number], string> | string
>;

export type DomainConfig<AppLocales extends Locales> = {
  /* Used by default if none of the defined locales match. */
  defaultLocale: AppLocales[number];

  /** The domain name (e.g. "example.com", "www.example.com" or "fr.example.com"). Note that the `x-forwarded-host` or alternatively the `host` header will be used to determine the requested domain. */
  domain: string;

  /** Optionally restrict which locales are available on this domain. */
  locales?: AppLocales;
};
