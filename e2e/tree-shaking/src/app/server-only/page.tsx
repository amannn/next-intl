import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import ServerOnlyPageContent from './ServerOnlyPageContent';

export default function ServerOnlyPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <ServerOnlyPageContent />
    </NextIntlClientProvider>
  );
}
