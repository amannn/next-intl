'use client';

import useHookLabel from '@/hooks/useHookLabel';

export default function HookTranslationPage() {
  const label = useHookLabel();
  return <p>{label}</p>;
}
