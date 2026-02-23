import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import PhotoPageContent from './PhotoPageContent';
import {use} from 'react';

type Props = {
  params: Promise<{id: string}>;
};

export default function PhotoPage({params}: Props) {
  const {id} = use(params);
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <PhotoPageContent id={id} />
    </NextIntlClientProvider>
  );
}
