import {getTranslations} from 'next-intl/server';

export async function ServerExample() {
  const t = await getTranslations('ServerDemo');
  return (
    <p className="text-2xl font-semibold text-foreground">{t('greeting')}</p>
  );
}
