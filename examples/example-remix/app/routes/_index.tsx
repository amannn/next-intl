import {useTranslations} from 'use-intl';

export default function Index() {
  const t = useTranslations('Index');

  return (
    <div
      style={{
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.5
      }}
    >
      <div style={{maxWidth: 510}}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </div>
    </div>
  );
}
