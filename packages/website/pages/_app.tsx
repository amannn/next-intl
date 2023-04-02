import {Inter} from '@next/font/google';
import {Analytics} from '@vercel/analytics/react';
import {AppProps} from 'next/app';
import Script from 'next/script';
import {ReactNode} from 'react';
import 'nextra-theme-docs/style.css';
import '../styles.css';

const inter = Inter({subsets: ['latin']});

type Props = AppProps & {
  Component: {getLayout?(page: ReactNode): ReactNode};
};

export default function App({Component, pageProps}: Props) {
  const getLayout = Component.getLayout || ((page: ReactNode) => page);
  return (
    <div className={inter.className}>
      {getLayout(<Component {...pageProps} />)}

      <Analytics />
      {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
        <Script
          async
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          defer
          src="/stats/umami.js"
        />
      )}
    </div>
  );
}
