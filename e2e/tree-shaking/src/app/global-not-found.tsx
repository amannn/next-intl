import DebugMessages from '@/components/DebugMessages';
import Document from '@/components/Document';
import Navigation from '@/components/Navigation';
import NotFound from '@/components/NotFound';
import {NextIntlClientProvider} from 'next-intl';

export default function GlobalNotFound() {
  return (
    <Document locale="en">
      <Navigation />
      <NextIntlClientProvider messages="infer">
        <DebugMessages />
        <NotFound />
      </NextIntlClientProvider>
    </Document>
  );
}
