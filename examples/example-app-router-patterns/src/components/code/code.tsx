import {PlaygroundBoundary} from '@/components/playground/boundary';
import {Pre, type RawCode, highlight} from 'codehike/code';
import {mark} from './annotations';

export async function Code({codeblock}: {codeblock: RawCode}) {
  const highlighted = await highlight(codeblock, 'github-from-css');

  const pre = (
    <Pre
      code={highlighted}
      handlers={[mark]}
      className="m-0 overflow-x-auto !bg-transparent py-3 !text-[13px] !leading-6"
    />
  );

  if (codeblock.meta) {
    return (
      <PlaygroundBoundary label={codeblock.meta} size="compact">
        {pre}
      </PlaygroundBoundary>
    );
  }

  return <div className="border-border border p-3">{pre}</div>;
}
