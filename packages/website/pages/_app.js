import 'nextra-theme-docs/style.css';
import '../styles.css';

export default function App({Component, pageProps}) {
  const getLayout = Component.getLayout || ((page) => page);
  return getLayout(<Component {...pageProps} />);
}
