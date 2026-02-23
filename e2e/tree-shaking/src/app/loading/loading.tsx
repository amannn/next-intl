import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import LoadingContent from './LoadingContent';

export default function Loading() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <LoadingContent />
    </NextIntlClientProvider>
  );
}
