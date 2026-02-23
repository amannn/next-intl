import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import ParallelPageContent from './ParallelPageContent';

export default function ParallelPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <ParallelPageContent />
    </NextIntlClientProvider>
  );
}
