import {Inter} from '@next/font/google';
import 'nextra-theme-docs/style.css';
import '../styles.css';

const inter = Inter({subsets: ['latin']});

export default function App({Component, pageProps}) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <div className={inter.className}>
      {getLayout(<Component {...pageProps} />)}
    </div>
  );
}
