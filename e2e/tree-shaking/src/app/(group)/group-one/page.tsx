import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import GroupOneContent from './GroupOneContent';

export default function GroupOnePage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <GroupOneContent />
    </NextIntlClientProvider>
  );
}
