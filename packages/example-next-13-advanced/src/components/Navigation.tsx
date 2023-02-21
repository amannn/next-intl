import {useTranslations} from 'next-intl';
import useNamedRoute from '../hooks/useNamedRoute';
import NavigationLink from './NavigationLink';

export default function Navigation() {
  const t = useTranslations('Navigation');
  const getHref = useNamedRoute();

  return (
    <nav style={{display: 'flex', gap: 10}}>
      <NavigationLink href={getHref('home')}>{t('home')}</NavigationLink>
      <NavigationLink href={getHref('client')}>{t('client')}</NavigationLink>
      <NavigationLink href={getHref('nested')}>{t('nested')}</NavigationLink>
    </nav>
  );
}
