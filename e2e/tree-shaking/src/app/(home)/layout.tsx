import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';

export default function HomeLayout({children}: LayoutProps<'/'>) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      {children}
    </NextIntlClientProvider>
  );
}
