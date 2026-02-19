import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import ParallelActivityDefaultContent from './ParallelActivityDefaultContent';

export default function ParallelActivityDefault() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <ParallelActivityDefaultContent />
    </NextIntlClientProvider>
  );
}
