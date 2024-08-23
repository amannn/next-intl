import {useTranslations} from 'next-intl';
import Login from './Login';
import NavLink from './NavLink';

export default function PublicNavigation() {
  const t = useTranslations('PublicNavigation');

  return (
    <nav className="flex gap-6 py-5">
      <NavLink href="/">{t('home')}</NavLink>
      <NavLink href="/about">{t('about')}</NavLink>
      <div className="ml-auto">
        <Login />
      </div>
    </nav>
  );
}
