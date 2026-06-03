import {useTranslations} from 'next-intl';

// A non-async Server Component — `useTranslations` works here too.
export function ServerExample() {
  const t = useTranslations('ServerComponentsPage');
  return (
    <p className="text-foreground text-2xl font-semibold">{t('greeting')}</p>
  );
}
