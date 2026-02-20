import {NextIntlClientProvider} from 'next-intl';
import MultiProviderTwoContent from './MultiProviderTwoContent';
import DebugMessages from '@/components/DebugMessages';

export default function MultiProviderTwo() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <MultiProviderTwoContent />
    </NextIntlClientProvider>
  );
}
