import {NextIntlMessages, NextIntlProvider} from 'next-intl';
import NextApp, {AppContext, AppProps} from 'next/app';

type Props = AppProps & {
  messages: NextIntlMessages;
};

export default function App({Component, messages, pageProps}: Props) {
  return (
    <NextIntlProvider
      // You can merge messages that should always be present
      // (from `App.getInitialProps`) with page-level
      // messages (from `getStaticProps` of individual pages)
      messages={{...messages, ...pageProps.messages}}
    >
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}

App.getInitialProps = async function getInitialProps(context: AppContext) {
  const {locale} = context.router;
  return {
    ...(await NextApp.getInitialProps(context)),
    messages: locale ? require(`../../messages/${locale}.json`) : undefined
  };
};
