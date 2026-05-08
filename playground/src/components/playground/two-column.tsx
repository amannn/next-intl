import type { ReactNode } from 'react';
import { Children, isValidElement } from 'react';

export function TwoColumn({ children }: { children: ReactNode }) {
  const prose: ReactNode[] = [];
  const code: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isCodeBlock(child) && code.length === 0) {
      code.push(child);
    } else {
      prose.push(child);
    }
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-8">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {prose}
      </div>
      <div>{code}</div>
    </div>
  );
}

function isCodeBlock(node: unknown): boolean {
  if (!isValidElement(node)) return false;
  const t = node.type;
  if (typeof t === 'function' && (t as { name?: string }).name === 'Code') {
    return true;
  }
  return t === 'pre';
}
