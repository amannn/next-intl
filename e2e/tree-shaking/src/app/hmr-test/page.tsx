import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import HmrTestContent from './HmrTestContent';

export default function HmrTestPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <HmrTestContent />
    </NextIntlClientProvider>
  );
}
