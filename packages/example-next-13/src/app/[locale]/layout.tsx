import {NextIntlServerProvider} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: Props) {
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlServerProvider
      formats={{
        dateTime: {
          medium: {
            dateStyle: 'medium',
            timeStyle: 'short',
            hour12: false
          }
        }
      }}
      locale={locale}
      messages={messages}
      now={new Date(1999, 11, 31, 23, 59)}
      timeZone="America/New_York"
    >
      {children}
    </NextIntlServerProvider>
  );
}
