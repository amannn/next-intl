import {NextIntlClientProvider} from 'next-intl';
import MultiProviderOneContent from './MultiProviderOneContent';
import DebugMessages from '@/components/DebugMessages';

export default function MultiProviderOne() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <MultiProviderOneContent />
    </NextIntlClientProvider>
  );
}
