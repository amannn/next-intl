import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';

export default function FeedLayout({children, modal}: LayoutProps<'/feed'>) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <section>
        <h1>Feed layout</h1>
        <div>{children}</div>
        <div>{modal}</div>
      </section>
    </NextIntlClientProvider>
  );
}
