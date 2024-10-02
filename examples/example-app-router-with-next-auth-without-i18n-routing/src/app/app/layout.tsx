'use client';

import {signOut} from 'next-auth/react';
import {useTranslations} from 'next-intl';
import {ReactNode} from 'react';
import NavLink from '@/components/NavLink';

export default function AppLayout({children}: {children: ReactNode}) {
  const t = useTranslations('AppLayout');

  function handleSignOut() {
    signOut();
  }

  return (
    <div className="flex grow flex-col">
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-2xl items-end justify-between">
          <nav className="flex gap-6 pt-6">
            <NavLink href="/app">{t('home')}</NavLink>
            <NavLink href="/app/profile">{t('profile')}</NavLink>
          </nav>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-2xl grow flex-col py-10">
        {children}
        <button
          className="mt-auto font-semibold text-slate-600 transition-colors hover:text-slate-900"
          onClick={handleSignOut}
          type="button"
        >
          {t('logout')} →
        </button>
      </div>
    </div>
  );
}
