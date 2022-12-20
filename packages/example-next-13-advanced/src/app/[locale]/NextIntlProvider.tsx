import {NextIntlServerProvider} from 'next-intl/server';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  locale: string;
};

/**
 * Configures `NextIntlServerProvider`, so the configuration can
 * be shared among `layout.tsx` as well as `head.tsx`.
 */
export default function NextIntlProvider({children, locale}: Props) {
  return (
    <NextIntlServerProvider locale={locale} timeZone="America/New_York">
      {children}
    </NextIntlServerProvider>
  );
}
