import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';

export default function UseTranslationsLayout({
  children
}: LayoutProps<'/use-translations'>) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      {children}
    </NextIntlClientProvider>
  );
}
