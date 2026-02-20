import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import ExplicitIdPageContent from './ExplicitIdPageContent';

export default function ExplicitIdPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <ExplicitIdPageContent />
    </NextIntlClientProvider>
  );
}
