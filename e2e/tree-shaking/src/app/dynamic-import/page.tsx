import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import DynamicImportPageContent from './DynamicImportPageContent';

export default function DynamicImportPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <DynamicImportPageContent />
    </NextIntlClientProvider>
  );
}
