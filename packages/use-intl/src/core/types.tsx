// https://www.totaltypescript.com/concepts/the-prettify-helper
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<Type> = {
  [Key in keyof Type]?: Type[Key] extends object
    ? DeepPartial<Type[Key]>
    : Type[Key];
};
