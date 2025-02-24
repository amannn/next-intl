import Head from 'next/head';
import {useRouter} from 'next/router';
import {NextIntlClientProvider} from 'next-intl';

export default function App({Component, pageProps}) {
  const router = useRouter();
  const {messages, now, ...rest} = pageProps;

  return (
    <NextIntlClientProvider
      locale={router.locale}
      messages={messages}
      now={new Date(now)}
      timeZone="Europe/Vienna"
    >
      <Head>
        <title>example-pages-router-legacy</title>
      </Head>
      <Component {...rest} />
    </NextIntlClientProvider>
  );
}
