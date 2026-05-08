import type { RawCode } from 'codehike/code';

export function Code({ codeblock }: { codeblock: RawCode }) {
  return <pre><code>{codeblock.value}</code></pre>;
}
