import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import CatchAllPageContent from './CatchAllPageContent';

type Props = {
  params: Promise<{parts: Array<string>}>;
};

export default function CatchAllPage({params}: Props) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <CatchAllPageContent params={params} />
    </NextIntlClientProvider>
  );
}
