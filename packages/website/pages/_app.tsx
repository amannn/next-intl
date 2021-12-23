import {AppProps} from 'next/app';
import 'nextra-theme-docs/style.css';
import '../styles.css';

export default function App({Component, pageProps}: AppProps) {
  return <Component {...pageProps} />;
}
