import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import PhotoPageContent from './PhotoPageContent';

type Props = {
  params: Promise<{id: string}>;
};

export default function PhotoPage({params}: Props) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <PhotoPageContent params={params} />
    </NextIntlClientProvider>
  );
}
