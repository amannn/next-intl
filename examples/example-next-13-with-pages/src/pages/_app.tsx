import {AppProps} from 'next/app';
import {NextRouter, withRouter} from 'next/router';
import {NextIntlClientProvider} from 'next-intl';

type Props = AppProps & {
  router: NextRouter;
};

function App({Component, pageProps, router}: Props) {
  return (
    <NextIntlClientProvider
      locale={(router.query?.locale as string) ?? 'en'}
      messages={pageProps.messages}
      timeZone="Europe/Vienna"
    >
      <Component {...pageProps} />
    </NextIntlClientProvider>
  );
}

export default withRouter(App);
