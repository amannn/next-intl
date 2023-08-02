import type {UrlObject} from 'url';

export type AllLocales = ReadonlyArray<string>;

export type Pathnames<Locales extends AllLocales> = Record<
  string,
  {[Key in Locales[number]]: string} | string
>;

export type StrictUrlObject<Pathname> = Omit<UrlObject, 'pathname'> & {
  pathname: Pathname;
};

export type HrefOrUrlObject<Pathname> = Pathname | StrictUrlObject<Pathname>;

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
