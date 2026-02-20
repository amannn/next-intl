import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import GroupTwoContent from './GroupTwoContent';

export default function GroupTwoPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <GroupTwoContent />
    </NextIntlClientProvider>
  );
}
