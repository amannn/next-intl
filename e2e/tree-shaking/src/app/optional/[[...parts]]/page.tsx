import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import OptionalCatchAllPageContent from './OptionalCatchAllPageContent';

type Props = {
  params: Promise<{parts?: Array<string>}>;
};

export default function OptionalCatchAllPage({params}: Props) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <OptionalCatchAllPageContent params={params} />
    </NextIntlClientProvider>
  );
}
