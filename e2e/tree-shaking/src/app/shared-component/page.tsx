import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import SharedComponentPageContent from './SharedComponentPageContent';

export default function SharedComponentPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <SharedComponentPageContent />
    </NextIntlClientProvider>
  );
}
