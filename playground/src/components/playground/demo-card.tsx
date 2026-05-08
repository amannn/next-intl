import type { ReactNode } from 'react';
import { PlaygroundBoundary } from './boundary';

export function DemoCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return <PlaygroundBoundary label={label}>{children}</PlaygroundBoundary>;
}
