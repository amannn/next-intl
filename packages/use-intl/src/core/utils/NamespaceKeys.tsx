import NestedValueOf from './NestedValueOf.tsx';

type NamespaceKeys<ObjectType, Keys extends string> = {
  [Property in Keys]: NestedValueOf<ObjectType, Property> extends string
    ? never
    : Property;
}[Keys];

export default NamespaceKeys;
