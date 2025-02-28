'use client';

import {useRouter} from '@/i18n/navigation';

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
