import {AppProps} from 'next/app';
import 'nextra-theme-docs/style.css';

export default function App({Component, pageProps}: AppProps) {
  return <Component {...pageProps} />;
}
