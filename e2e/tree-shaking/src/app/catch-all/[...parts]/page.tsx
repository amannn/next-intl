import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import CatchAllPageContent from './CatchAllPageContent';
import {use} from 'react';

type Props = {
  params: Promise<{parts: Array<string>}>;
};

export default function CatchAllPage({params}: Props) {
  const {parts} = use(params);
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <CatchAllPageContent parts={parts} />
    </NextIntlClientProvider>
  );
}
