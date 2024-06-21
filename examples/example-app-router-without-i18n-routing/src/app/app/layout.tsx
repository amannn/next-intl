import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {ReactNode} from 'react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import NavLink from '@/components/NavLink';

export default function AppLayout({children}: {children: ReactNode}) {
  const t = useTranslations('AppLayout');

  return (
    <div className="flex grow flex-col">
      <div className="bg-white">
        <div className="mx-auto flex max-w-2xl items-end justify-between">
          <nav className="flex gap-6 pt-6">
            <NavLink href="/app">{t('home')}</NavLink>
            <NavLink href="/app/profile">{t('profile')}</NavLink>
          </nav>
          <div className="mb-[2px] flex items-center">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-2xl grow flex-col py-10">
        {children}
        <Link
          className="mt-auto font-semibold text-slate-600 transition-colors hover:text-slate-900"
          href="/"
        >
          Logout →
        </Link>
      </div>
    </div>
  );
}
