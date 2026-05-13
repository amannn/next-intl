import {Pre, type RawCode, highlight} from 'codehike/code';
import {mark, callout, focus, link, fold, lineNumbers} from './annotations';
import {PlaygroundBoundary} from '@/components/playground/boundary';

const handlers = [mark, callout, focus, link, fold, lineNumbers];

export async function Code({codeblock}: {codeblock: RawCode}) {
  const highlighted = await highlight(codeblock, 'github-from-css');

  const pre = (
    <Pre
      code={highlighted}
      handlers={handlers}
      className="!bg-transparent !text-[13px] !leading-6 m-0 overflow-x-auto py-3"
    />
  );

  if (codeblock.meta) {
    return (
      <PlaygroundBoundary label={codeblock.meta} size="compact">
        {pre}
      </PlaygroundBoundary>
    );
  }

  return <div className="border border-border p-3">{pre}</div>;
}
