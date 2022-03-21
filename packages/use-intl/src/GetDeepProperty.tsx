// Kudos to https://github.com/cursorsdottsx/ from https://stackoverflow.com/q/71529277/343045
type GetDeepProperty<
  ObjectType,
  Property extends string
> = Property extends `${infer Key}.${infer Rest}`
  ? Key extends keyof ObjectType
    ? GetDeepProperty<ObjectType[Key], Rest>
    : never
  : Property extends keyof ObjectType
  ? ObjectType[Property]
  : never;

export default GetDeepProperty;
