import type { ReactNode } from 'react';

export function DemoCard({
  label = 'Live demo',
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12 rounded-xl border border-border bg-card/60 backdrop-blur p-6 sm:p-8">
      <div className="mb-4 text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div>{children}</div>
    </section>
  );
}
