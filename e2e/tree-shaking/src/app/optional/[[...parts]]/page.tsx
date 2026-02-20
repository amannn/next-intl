import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import OptionalCatchAllPageContent from './OptionalCatchAllPageContent';
import {use} from 'react';

type Props = {
  params: Promise<{parts?: Array<string>}>;
};

export default function OptionalCatchAllPage({params}: Props) {
  const {parts} = use(params);
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <OptionalCatchAllPageContent parts={parts} />
    </NextIntlClientProvider>
  );
}
