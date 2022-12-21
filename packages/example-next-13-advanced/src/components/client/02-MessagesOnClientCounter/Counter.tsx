import pick from 'lodash/pick';
import {useLocale} from 'next-intl';
import {NextIntlClientProvider} from 'next-intl/client';
import {use} from 'react';
import ClientCounter from './ClientCounter';

export default function Counter() {
  const locale = useLocale();
  const messages = use(import(`../../../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={
        // Only provide the minimum of messages
        pick(messages, 'ClientCounter')
      }
    >
      <ClientCounter />
    </NextIntlClientProvider>
  );
}
