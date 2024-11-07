export type OnlyOptional<T> = Partial<T> extends T ? true : false;

// https://www.totaltypescript.com/concepts/the-prettify-helper
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
