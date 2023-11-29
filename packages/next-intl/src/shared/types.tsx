export type AllLocales = ReadonlyArray<string>;

export type LocalePrefix = 'as-needed' | 'always' | 'never';

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
