import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider, useExtracted} from 'next-intl';
import TypeImportComponent from './TypeImportComponent';

export type Test = 'test';

export default function TypeImportsPage() {
  const t = useExtracted();
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <div>
        <p>{t('Type imports page')}</p>
        <TypeImportComponent />
      </div>
    </NextIntlClientProvider>
  );
}
