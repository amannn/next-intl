import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';

export function DemoCard({
  label = 'Live demo',
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 rounded-lg border border-border bg-card p-6">
      <Badge variant="secondary" className="mb-3 uppercase tracking-wide">
        {label}
      </Badge>
      <div>{children}</div>
    </section>
  );
}
