import {AppProps} from 'next/app';
import {NextIntlClientProvider} from 'next-intl';

export default function App({Component, pageProps}: AppProps) {
  return (
    <NextIntlClientProvider messages={pageProps.messages}>
      <Component {...pageProps} />
    </NextIntlClientProvider>
  );
}
