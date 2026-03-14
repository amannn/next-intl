import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import FeedPhotoModalPageContent from './FeedPhotoModalPageContent';

type Props = {
  params: Promise<{id: string}>;
};

export default function FeedPhotoModalPage({params}: Props) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <FeedPhotoModalPageContent params={params} />
    </NextIntlClientProvider>
  );
}
