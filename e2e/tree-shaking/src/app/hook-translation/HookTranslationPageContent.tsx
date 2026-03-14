'use client';

import useHookLabel from '@/hooks/useHookLabel';
import ClientBoundary from '@/components/ClientBoundary';

export default function HookTranslationPageContent() {
  const label = useHookLabel();
  return (
    <ClientBoundary>
      <p>{label}</p>
    </ClientBoundary>
  );
}
