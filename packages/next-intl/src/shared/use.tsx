import * as react from 'react';

export default function use<Value>(value: Promise<Value>): Value {
  // @ts-expect-error -- Ooof, Next.js doesn't make this easy.
  // `use` is only available in React 19 canary, but we can
  // use it in Next.js already as Next.js "vendors" a fixed
  // version of React. However, if we'd simply put `use` in
  // ESM code, then the build doesn't work since React does
  // not export `use` officially. Therefore, we have to use
  // something that is not statically analyzable. Once React
  // 19 is out, we can remove this in the next major version.
  return react['use'.trim()](value);
}
