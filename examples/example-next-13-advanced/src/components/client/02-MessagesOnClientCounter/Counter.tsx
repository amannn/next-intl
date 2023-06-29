import pick from 'lodash/pick';
import {useLocale, NextIntlClientProvider, useMessages} from 'next-intl';
import ClientCounter from './ClientCounter';

export default function Counter() {
  const locale = useLocale();
  const messages = useMessages();
  if (!messages) return null;

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
