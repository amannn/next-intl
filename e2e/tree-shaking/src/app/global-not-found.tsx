import Document from '@/components/Document';
import NotFound from '@/components/NotFound';
import {NextIntlClientProvider, useMessages} from 'next-intl';

export default function GlobalNotFound() {
  const messages = useMessages();

  // Note: `global-not-found` is currently not supported with
  // `messages="infer"`, therefore we're providing messages manually.

  return (
    <Document locale="en">
      <NextIntlClientProvider messages={{NotFound: messages.NotFound}}>
        <NotFound />
      </NextIntlClientProvider>
    </Document>
  );
}
