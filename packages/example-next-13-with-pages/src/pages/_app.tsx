import {NextIntlProvider} from 'next-intl';
import {AppProps} from 'next/app';
import {NextRouter, withRouter} from 'next/router';

type Props = AppProps & {
  router: NextRouter;
};

function App({Component, pageProps, router}: Props) {
  return (
    <NextIntlProvider
      locale={(router.query?.locale as string) ?? 'en'}
      messages={pageProps.messages}
    >
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}

export default withRouter(App);
