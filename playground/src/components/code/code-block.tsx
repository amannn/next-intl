'use client';

import {useEffect, useState} from 'react';
import {Pre, type HighlightedCode, highlight} from 'codehike/code';

export function CodeBlock({
  code,
  lang = 'tsx',
  className
}: {
  code: string;
  lang?: string;
  className?: string;
}) {
  const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null);

  useEffect(() => {
    let cancelled = false;
    highlight({value: code, lang, meta: ''}, 'github-from-css').then((h) => {
      if (!cancelled) setHighlighted(h);
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  if (!highlighted) {
    return (
      <pre
        className={`overflow-x-auto border border-border bg-background p-3 text-[13px] leading-6 text-muted-foreground ${className ?? ''}`}
      >
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div className={`border border-border ${className ?? ''}`}>
      <Pre
        code={highlighted}
        className="!bg-transparent !text-[13px] !leading-6 m-0 overflow-x-auto p-3"
      />
    </div>
  );
}
