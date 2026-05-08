import { useTranslations } from 'next-intl';

export function ServerExample() {
  const t = useTranslations('ServerDemo');
  return (
    <p className="text-2xl font-semibold text-foreground">{t('greeting')}</p>
  );
}
