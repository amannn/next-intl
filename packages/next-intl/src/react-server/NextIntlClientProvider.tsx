import React, {ComponentProps} from 'react';
import BaseNextIntlClientProvider from '../shared/NextIntlClientProvider';
import useLocale from './useLocale';
import useNow from './useNow';
import useTimeZone from './useTimeZone';

type Props = ComponentProps<typeof BaseNextIntlClientProvider>;

export default function NextIntlClientProvider({
  locale,
  now,
  timeZone,
  ...rest
}: Props) {
  const defaultLocale = useLocale();
  const defaultNow = useNow();
  const defaultTimeZone = useTimeZone();

  return (
    <BaseNextIntlClientProvider
      locale={locale ?? defaultLocale}
      now={now ?? defaultNow}
      timeZone={timeZone ?? defaultTimeZone}
      {...rest}
    />
  );
}
