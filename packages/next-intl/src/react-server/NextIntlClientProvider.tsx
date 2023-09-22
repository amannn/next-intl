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
  let defaultLocale, defaultNow, defaultTimeZone;

  // These hook calls can fail if this component is rendered in RSC, but the
  // plugin has not been added. This is mostly for backwards compatibility.
  try {
    /* eslint-disable react-hooks/rules-of-hooks -- */
    defaultLocale = useLocale();
    defaultNow = useNow();
    defaultTimeZone = useTimeZone();
    /* eslint-enable react-hooks/rules-of-hooks */
  } catch (e) {
    // Ignore
  }

  return (
    <BaseNextIntlClientProvider
      locale={locale ?? defaultLocale}
      now={now ?? defaultNow}
      timeZone={timeZone ?? defaultTimeZone}
      {...rest}
    />
  );
}
