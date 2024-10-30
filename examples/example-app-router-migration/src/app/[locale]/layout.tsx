import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {ReactNode} from 'react';
import {routing} from '@/i18n/routing';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default async function LocaleLayout({children, params}: Props) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(params.locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={params.locale}>
      <head>
        <title>next-intl</title>
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
