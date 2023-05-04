import pick from 'lodash/pick';
import {useLocale, NextIntlClientProvider} from 'next-intl';
import ClientCounter from './ClientCounter';

export default async function Counter() {
  const locale = useLocale();
  const messages = (await import(`../../../../messages/${locale}.json`))
    .default;

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
