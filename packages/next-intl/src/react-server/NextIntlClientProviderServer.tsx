import {ComponentProps} from 'react';
import getConfigNow from '../server/react-server/getConfigNow.tsx';
import getFormats from '../server/react-server/getFormats.tsx';
import {getLocale, getTimeZone} from '../server.react-server.tsx';
import BaseNextIntlClientProvider from '../shared/NextIntlClientProvider.tsx';

type Props = ComponentProps<typeof BaseNextIntlClientProvider>;

export default async function NextIntlClientProviderServer({
  formats,
  locale,
  now,
  timeZone,
  ...rest
}: Props) {
  return (
    <BaseNextIntlClientProvider
      // We need to be careful about potentially reading from headers here.
      // See https://github.com/amannn/next-intl/issues/631
      formats={formats === undefined ? await getFormats() : formats}
      locale={locale ?? (await getLocale())}
      // Note that don't assign a default for `now` here
      now={now ?? (await getConfigNow())}
      timeZone={timeZone ?? (await getTimeZone())}
      {...rest}
    />
  );
}
