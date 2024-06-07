import {Inter} from 'next/font/google';
import {ReactNode} from 'react';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
});

type Props = {
  children: ReactNode;
  locale: string;
};

export default function Document({children, locale}: Props) {
  return (
    <html className={inter.className} lang={locale}>
      <body>{children}</body>
    </html>
  );
}
