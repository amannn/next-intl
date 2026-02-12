import {NextIntlClientProvider} from 'next-intl';
import DebugMessages from '@/components/DebugMessages';

export default function LinkedDependencyLayout({
  children
}: LayoutProps<'/linked-dependency'>) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      {children}
    </NextIntlClientProvider>
  );
}
