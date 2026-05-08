import { Pre, type RawCode, highlight } from 'codehike/code';
import { mark, callout, focus, link, fold, lineNumbers } from './annotations';

const handlers = [mark, callout, focus, link, fold, lineNumbers];

export async function Code({ codeblock }: { codeblock: RawCode }) {
  const highlighted = await highlight(codeblock, 'github-from-css');

  const filename = codeblock.meta;
  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      {filename ? (
        <div className="px-3 py-1.5 text-xs font-mono uppercase tracking-wide text-muted-foreground border-b border-border bg-muted/40">
          {filename}
        </div>
      ) : null}
      <Pre
        code={highlighted}
        handlers={handlers}
        className="!bg-transparent !text-sm !leading-6 px-3 py-3 overflow-x-auto"
      />
    </div>
  );
}
