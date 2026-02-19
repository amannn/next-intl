import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import HookTranslationPageContent from './HookTranslationPageContent';

export default function HookTranslationPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <HookTranslationPageContent />
    </NextIntlClientProvider>
  );
}
