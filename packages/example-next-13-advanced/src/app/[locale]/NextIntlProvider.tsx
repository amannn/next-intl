import {NextIntlServerProvider} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  locale: string;
};

export default async function NextIntlProvider({children, locale}: Props) {
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlServerProvider
      defaultTranslationValues={{
        globalString: 'Global string',
        highlight: (chunks) => <strong>{chunks}</strong>
      }}
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
      timeZone="America/New_York"
    >
      {children}
    </NextIntlServerProvider>
  );
}
