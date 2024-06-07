import {useTranslations} from 'next-intl';
import Logout from './Logout';
import NavLink from './NavLink';

export default function AppNavigation() {
  const t = useTranslations('AppNavigation');

  return (
    <nav className="flex gap-6 py-5">
      <NavLink href="/app">{t('home')}</NavLink>
      <NavLink href="/app/profile">{t('profile')}</NavLink>
      <div className="ml-auto">
        <Logout />
      </div>
    </nav>
  );
}
