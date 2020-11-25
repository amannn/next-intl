import {NextIntlMessages, NextIntlProvider} from 'next-intl';
import NextApp, {AppContext, AppProps} from 'next/app';

type Props = AppProps & {
  messages: NextIntlMessages;
};

export default function App({Component, messages, pageProps}: Props) {
  return (
    <NextIntlProvider locale="en" messages={messages}>
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
