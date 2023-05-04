import {AppProps} from 'next/app';
import {NextIntlProvider} from 'next-intl';

export default function App({Component, pageProps}: AppProps) {
  return (
    <NextIntlProvider messages={pageProps.messages}>
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}
