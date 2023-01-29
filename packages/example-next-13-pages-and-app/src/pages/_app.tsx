import { NextIntlProvider } from "next-intl";
import { AppProps } from "next/app";
import { NextRouter } from "next/router";
import { withRouter } from "next/router";

interface WithRouterProps {
  router: NextRouter;
}

function App({ Component, pageProps, router }: AppProps & WithRouterProps) {
  return (
    <NextIntlProvider
      messages={pageProps.messages}
      locale={(router.query?.locale as string) ?? "en"}
    >
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}

export default withRouter(App);
