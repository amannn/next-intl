import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import FeedModalDefaultContent from './FeedModalDefaultContent';

export default function FeedModalDefault() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <FeedModalDefaultContent />
    </NextIntlClientProvider>
  );
}
