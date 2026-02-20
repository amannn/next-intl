import {NextIntlClientProvider, useExtracted} from 'next-intl';

export default function Page() {
  const t = useExtracted();
  const tUi = useExtracted('ui');
  return (
    <NextIntlClientProvider messages="infer">
      <h1>{t('Hello world')}</h1>
      <p>{t('Count: {count, number}', {count: 0})}</p>
      <button>{tUi('Submit')}</button>
    </NextIntlClientProvider>
  );
}
