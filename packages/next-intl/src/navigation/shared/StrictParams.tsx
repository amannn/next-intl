type ParamValue = string | number | boolean;

type ReadFrom<Path> = Path extends `${string}[${infer Rest}`
  ? ReadUntil<Rest>
  : [];

type ReadUntil<Path> = Path extends `${infer Match}]${infer Rest}`
  ? [Match, ...ReadFrom<Rest>]
  : [];

type RemovePrefixes<Key> = Key extends `[...${infer Name}`
  ? Name
  : Key extends `...${infer Name}`
    ? Name
    : Key;

type StrictParams<Pathname> = Pathname extends `${string}[${string}`
  ? {
      [Key in ReadFrom<Pathname>[number] as RemovePrefixes<Key>]: Key extends `[...${string}`
        ? Array<ParamValue> | undefined
        : Key extends `...${string}`
          ? Array<ParamValue>
          : ParamValue;
    }
  : never;

export default StrictParams;
export type {StrictParams};
