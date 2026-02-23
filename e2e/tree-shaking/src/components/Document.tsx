import {Locale} from 'next-intl';
import {Inter} from 'next/font/google';
import {ReactNode} from 'react';
import './Document.css';

const inter = Inter({subsets: ['latin']});

type Props = {
  children: ReactNode;
  locale: Locale;
};

export default function Document({children, locale}: Props) {
  return (
    <html lang={locale}>
      <body className={`${inter.className} flex flex-col gap-2.5`}>
        {children}
      </body>
    </html>
  );
}
