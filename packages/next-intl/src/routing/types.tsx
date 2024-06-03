export type AllLocales = ReadonlyArray<string>;

export type LocalePrefixMode = 'always' | 'as-needed' | 'never';

export type LocalePrefixes<Locales extends AllLocales> = Partial<
  Record<Locales[number], string>
>;

export type LocalePrefixConfigVerbose<Locales extends AllLocales> =
  | {
      mode: 'always';
      prefixes?: LocalePrefixes<Locales>;
    }
  | {
      mode: 'as-needed';
      prefixes?: LocalePrefixes<Locales>;
    }
  | {
      mode: 'never';
    };

export type LocalePrefixConfig<Locales extends AllLocales> =
  | LocalePrefixMode
  | LocalePrefixConfigVerbose<Locales>;

export type Pathnames<Locales extends AllLocales> = Record<
  string,
  Record<Locales[number], string> | string
>;

export type DomainConfig<Locales extends AllLocales> = {
  /* Used by default if none of the defined locales match. */
  defaultLocale: Locales[number];

  /** The domain name (e.g. "example.com", "www.example.com" or "fr.example.com"). Note that the `x-forwarded-host` or alternatively the `host` header will be used to determine the requested domain. */
  domain: string;

  /** Optionally restrict which locales are available on this domain. */
  locales?: Locales;
};
