import NestedValueOf from './NestedValueOf.tsx';

type MessageKeys<ObjectType, Keys extends string> = {
  [Property in Keys]: NestedValueOf<ObjectType, Property> extends string
    ? Property
    : never;
}[Keys];

export default MessageKeys;
