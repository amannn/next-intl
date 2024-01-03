import {
  _getRequestLocale as getRequestLocale,
  _getConfig as getConfig
  // @ts-ignore -- Only available after build
} from 'next-intl/server';
import React, {ComponentProps} from 'react';
import BaseNextIntlClientProvider from '../shared/NextIntlClientProvider';

type Props = ComponentProps<typeof BaseNextIntlClientProvider>;

export default async function NextIntlClientProvider({
  locale,
  now,
  timeZone,
  ...rest
}: Props) {
  // We need to be careful about potentially reading from headers here.
  // See https://github.com/amannn/next-intl/issues/631
  if (!locale) locale = getRequestLocale();
  if (!now) now = await getConfig(locale).now;
  if (!timeZone) timeZone = await getConfig(locale).timeZone;

  return (
    <BaseNextIntlClientProvider
      locale={locale}
      now={now}
      timeZone={timeZone}
      {...rest}
    />
  );
}
