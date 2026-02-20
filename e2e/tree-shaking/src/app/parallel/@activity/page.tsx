import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import ParallelActivityPageContent from './ParallelActivityPageContent';

export default function ParallelActivityPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <ParallelActivityPageContent />
    </NextIntlClientProvider>
  );
}
