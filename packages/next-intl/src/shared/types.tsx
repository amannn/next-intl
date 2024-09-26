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

// https://www.totaltypescript.com/concepts/the-prettify-helper
export type Prettify<Type> = {
  [Key in keyof Type]: Type[Key];
} & {};
