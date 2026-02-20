import {useExtracted} from 'next-intl';
import NavigationItem from './NavigationItem';

export default function Navigation() {
  const t = useExtracted('Navigation');

  return (
    <nav className="flex flex-wrap gap-4 p-4 border-b border-gray-300">
      <NavigationItem href="/" label={t('Home')} />
      <NavigationItem href="/loading" label={t('Loading')} />
      <NavigationItem
        href="/dynamic-segment/test"
        label={t('Dynamic segment (test)')}
      />
      <NavigationItem href="/catch-all/a/b/c" label={t('Catch-all (a/b/c)')} />
      <NavigationItem
        href="/optional/x/y"
        label={t('Optional catch-all (x/y)')}
      />
      <NavigationItem href="/actions" label={t('Actions')} />
      <NavigationItem href="/type-imports" label={t('Type imports')} />
      <NavigationItem href="/group-one" label={t('Group (one)')} />
      <NavigationItem href="/group-two" label={t('Group (two)')} />
      <NavigationItem href="/parallel" label={t('Parallel')} />
      <NavigationItem href="/feed" label={t('Feed')} />
      <NavigationItem
        href="/photo/alpha"
        label={t('Photo (intercept from feed)')}
      />
      <NavigationItem href="/dynamic-import" label={t('Dynamic import')} />
      <NavigationItem href="/hook-translation" label={t('Hook translation')} />
      <NavigationItem href="/layout-template" label={t('Layout template')} />
      <NavigationItem href="/shared-component" label={t('Shared component')} />
      <NavigationItem href="/use-translations" label={t('Use translations')} />
      <NavigationItem
        href="/linked-dependency"
        label={t('Linked dependency')}
      />
      <NavigationItem href="/multi-provider" label={t('Multi provider')} />
    </nav>
  );
}
