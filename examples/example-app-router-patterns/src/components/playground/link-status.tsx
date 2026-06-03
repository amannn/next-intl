'use client';

import {useLinkStatus} from 'next/link';

export function LinkStatus() {
  const {pending} = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      role="status"
      aria-label="Loading"
      className="border-muted-foreground/30 border-t-muted-foreground ml-auto size-3 shrink-0 animate-spin rounded-full border-2"
    />
  );
}
