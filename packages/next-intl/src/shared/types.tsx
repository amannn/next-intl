export type AllLocales = ReadonlyArray<string>;

export type LocalePrefixMode = 'as-needed' | 'always' | 'never';

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
  {[Key in Locales[number]]: string} | string
>;

export type ParametersExceptFirst<Fn> = Fn extends (
  arg0: any,
  ...rest: infer R
) => any
  ? R
  : never;

export type ParametersExceptFirstTwo<Fn> = Fn extends (
  arg0: any,
  arg1: any,
  ...rest: infer R
) => any
  ? R
  : never;
