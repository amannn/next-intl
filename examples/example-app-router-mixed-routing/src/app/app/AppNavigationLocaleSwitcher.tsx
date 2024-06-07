'use client';

import {useRouter} from 'next/navigation';
import updateLocale from './updateLocale';
import {useLocale} from 'next-intl';
import {Locale} from '@/config';

export default function AppNavigationLocaleSwitcher() {
  const router = useRouter();

  async function action(data: FormData) {
    await updateLocale(data);
    router.refresh();
  }

  return (
    <form className="flex gap-3 py-5" action={action}>
      <LocaleButton locale="en" />
      <LocaleButton locale="de" />
    </form>
  );
}

function LocaleButton({locale}: {locale: Locale}) {
  const curLocale = useLocale();

  return (
    <button
      className={curLocale === locale ? 'underline' : undefined}
      name="locale"
      value={locale}
    >
      {locale.toUpperCase()}
    </button>
  );
}
