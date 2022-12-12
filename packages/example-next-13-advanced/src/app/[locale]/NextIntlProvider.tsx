import {IntlError} from 'next-intl';
import {NextIntlServerProvider} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  locale: string;
};

/**
 * Configures `NextIntlServerProvider`, so the configuration can
 * be shared among `layout.tsx` as well as `head.tsx`.
 */
export default async function NextIntlProvider({children, locale}: Props) {
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  function getMessageFallback({
    key,
    namespace
  }: {
    namespace?: string;
    key: string;
  }) {
    return (
      '`getMessageFalback` called for ' +
      [namespace, key].filter((part) => part != null).join('.')
    );
  }

  function onError(error: IntlError) {
    if (
      error.message ===
      'MISSING_MESSAGE: Could not resolve `missing` in `Index`.'
    ) {
      // Do nothing, this error is triggered on purpose
    } else {
      console.error(JSON.stringify(error.message));
    }
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
      getMessageFallback={getMessageFallback}
      locale={locale}
      messages={messages}
      onError={onError}
      timeZone="America/New_York"
    >
      {children}
    </NextIntlServerProvider>
  );
}
