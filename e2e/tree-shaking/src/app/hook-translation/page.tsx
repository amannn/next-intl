'use client';

import useHookLabel from '@/hooks/useHookLabel';
import ClientBoundary from '@/components/ClientBoundary';

export default function HookTranslationPage() {
  const label = useHookLabel();
  return (
    <ClientBoundary>
      <p>{label}</p>
    </ClientBoundary>
  );
}
