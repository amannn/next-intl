type ICUTags<
  MessageString extends string,
  TagsFn
> = MessageString extends `${infer Prefix}<${infer TagName}>${infer Content}</${string}>${infer Tail}`
  ? Record<TagName, TagsFn> & ICUTags<`${Prefix}${Content}${Tail}`, TagsFn>
  : {};

export default ICUTags;
