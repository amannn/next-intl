import {Inter} from 'next/font/google';
import './globals.css';
import {clsx} from 'clsx';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html>
      <body className={clsx(inter.variable, 'antialiased')}>{children}</body>
    </html>
  );
}
