export type NestedKeyOf<ObjectType> = ObjectType extends object
  ? {
      [Property in keyof ObjectType]:
        | `${Property & string}`
        | `${Property & string}.${NestedKeyOf<ObjectType[Property]>}`;
    }[keyof ObjectType]
  : never;

export type NestedValueOf<
  ObjectType,
  Path extends string
> = Path extends `${infer Cur}.${infer Rest}`
  ? Cur extends keyof ObjectType
    ? NestedValueOf<ObjectType[Cur], Rest>
    : never
  : Path extends keyof ObjectType
    ? ObjectType[Path]
    : never;

export type NamespaceKeys<ObjectType, AllKeys extends string> = {
  [PropertyPath in AllKeys]: NestedValueOf<
    ObjectType,
    PropertyPath
  > extends string
    ? never
    : PropertyPath;
}[AllKeys];

export type MessageKeys<ObjectType, AllKeys extends string> = {
  [PropertyPath in AllKeys]: [string] extends [PropertyPath]
    ? // When `PropertyPath` is the generic `string` type (e.g. from `any` messages),
      // fall back to the original behavior to avoid excluding all keys
      NestedValueOf<ObjectType, PropertyPath> extends string
      ? PropertyPath
      : never
    : // When `PropertyPath` is a string literal, check that the value is not `never`.
      // `never` means the key doesn't exist in all union members of `ObjectType`.
      // Note: without this check, `never extends string` is `true` (vacuously),
      // which would incorrectly include the key.
      [NestedValueOf<ObjectType, PropertyPath>] extends [never]
      ? never
      : NestedValueOf<ObjectType, PropertyPath> extends string
        ? PropertyPath
        : never;
}[AllKeys];
