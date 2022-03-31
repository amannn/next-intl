import {NextComponentType} from 'next';
import {AppProps} from 'next/app';
import {ReactNode} from 'react';
import 'nextra-theme-docs/style.css';
import '../styles.css';

export default function App({
  Component,
  pageProps
}: AppProps & {
  Component: NextComponentType & {
    getLayout(page: ReactNode): ReactNode;
  };
}) {
  const getLayout = Component.getLayout || ((page: ReactNode) => page);
  return getLayout(<Component {...pageProps} />);
}
