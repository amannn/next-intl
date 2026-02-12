import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';

export default function DynamicSegmentLayout({
  children
}: LayoutProps<'/dynamic-segment/[slug]'>) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      {children}
    </NextIntlClientProvider>
  );
}
