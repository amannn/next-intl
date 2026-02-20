import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import FeedPageContent from './FeedPageContent';

export default function FeedPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <FeedPageContent />
    </NextIntlClientProvider>
  );
}
