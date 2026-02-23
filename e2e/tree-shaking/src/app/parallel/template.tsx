import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import ParallelTemplateContent from './ParallelTemplateContent';

export default function ParallelTemplate() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <ParallelTemplateContent />
    </NextIntlClientProvider>
  );
}
