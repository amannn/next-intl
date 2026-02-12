import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';

export default function ActionsLayout({children}: LayoutProps<'/actions'>) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      {children}
    </NextIntlClientProvider>
  );
}
