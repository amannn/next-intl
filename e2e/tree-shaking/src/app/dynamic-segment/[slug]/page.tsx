import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import DynamicSlugPageContent from './DynamicSlugPageContent';

type Props = {
  params: Promise<{slug: string}>;
};

export default function DynamicSlugPage({params}: Props) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <DynamicSlugPageContent params={params} />
    </NextIntlClientProvider>
  );
}
