import {Inter} from '@next/font/google';
// eslint-disable-next-line import/no-unresolved
import {Analytics} from '@vercel/analytics/react';
import 'nextra-theme-docs/style.css';
import '../styles.css';

const inter = Inter({subsets: ['latin']});

export default function App({Component, pageProps}) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <div className={inter.className}>
      {getLayout(<Component {...pageProps} />)}
      <Analytics />
    </div>
  );
}
