'use client';

import {useRouter} from '@/i18n/routing';

export default function ClientRouterWithoutProvider() {
  const router = useRouter();

  function onClick() {
    router.push('/nested');
  }

  return (
    <button
      data-testid="ClientRouterWithoutProvider-link"
      onClick={onClick}
      type="button"
    >
      Go to nested page
    </button>
  );
}
