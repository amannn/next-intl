import {useTranslations} from 'next-intl';
import NavLink from './NavLink';

export default function AppNavigation() {
  const t = useTranslations('AppNavigation');

  return (
    <nav className="flex flex-col gap-6">
      <NavLink href="/app">{t('home')}</NavLink>
      <NavLink href="/app/profile">{t('profile')}</NavLink>
    </nav>
  );
}
