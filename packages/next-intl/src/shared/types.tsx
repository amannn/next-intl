export type AllLocales = ReadonlyArray<string>;

export type LocalePrefix = 'as-needed' | 'always' | 'never';

export type Pathnames<Locales extends AllLocales> = Record<
  string,
  {[Key in Locales[number]]: string} | string
>;

export type RoutingLocales<Locales extends AllLocales> = ReadonlyArray<
  | Locales[number]
  | {
      /** The locale code available internally (e.g. `/en-gb`) */
      locale: Locales[number];
      /** The prefix this locale should be available at (e.g. `/uk`) */
      prefix: string;
    }
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
