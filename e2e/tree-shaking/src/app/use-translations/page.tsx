import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import UseTranslationsPageContent from './UseTranslationsPageContent';

export default function UseTranslationsPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <UseTranslationsPageContent />
    </NextIntlClientProvider>
  );
}
