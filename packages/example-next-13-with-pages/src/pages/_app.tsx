import { NextIntlProvider } from "next-intl";
import { NextRouter, withRouter } from "next/router";
import type { AppProps } from "next/app";

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
