import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import LayoutTemplatePageContent from './LayoutTemplatePageContent';

export default function LayoutTemplatePage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <LayoutTemplatePageContent />
    </NextIntlClientProvider>
  );
}
