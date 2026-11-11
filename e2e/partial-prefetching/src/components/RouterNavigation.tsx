'use client';

import {useRouter} from '@/i18n/navigation';

export default function RouterNavigation() {
  const router = useRouter();

  return (
    <button onClick={() => router.push('/', {locale: 'de'})}>
      Go to German home page
    </button>
  );
}
