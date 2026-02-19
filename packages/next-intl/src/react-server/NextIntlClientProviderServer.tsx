import type {ComponentProps} from 'react';
import getConfigNow from '../server/react-server/getConfigNow.js';
import getFormats from '../server/react-server/getFormats.js';
import {getPathname} from '../server/react-server/getPathname.js';
import {getLocale, getMessages, getTimeZone} from '../server.react-server.js';
import BaseNextIntlClientProvider from '../shared/NextIntlClientProvider.js';
import {
  inferMessagesForPathname,
  loadTreeShakingManifest
} from '../tree-shaking/inferMessages.js';

type Props = ComponentProps<typeof BaseNextIntlClientProvider>;
type ResolvedMessages = Exclude<Props['messages'], 'infer'>;

async function resolveMessages(): Promise<ResolvedMessages> {
  const allMessages = await getMessages();
  const manifest = await loadTreeShakingManifest();
  if (!manifest) {
    return allMessages;
  }

  const pathname = await getPathname();
  if (!pathname) {
    return allMessages;
  }

  const inferredMessages = inferMessagesForPathname(
    allMessages as Record<string, unknown>,
    manifest,
    pathname
  );
  return inferredMessages as ResolvedMessages;
}

export default async function NextIntlClientProviderServer({
  formats,
  locale,
  messages,
  now,
  timeZone,
  ...rest
}: Props) {
  let clientMessages;
  if (messages === undefined) {
    clientMessages = await getMessages();
  } else if (messages === 'infer') {
    clientMessages = await resolveMessages();
  } else {
    clientMessages = messages;
  }

  return (
    <BaseNextIntlClientProvider
      // We need to be careful about potentially reading from headers here.
      // See https://github.com/amannn/next-intl/issues/631
      formats={formats === undefined ? await getFormats() : formats}
      locale={locale ?? (await getLocale())}
      messages={clientMessages}
      // Note that we don't assign a default for `now` here,
      // we only read one from the request config - if any.
      // Otherwise this would cause a `dynamicIO` error.
      now={now ?? (await getConfigNow())}
      timeZone={timeZone ?? (await getTimeZone())}
      {...rest}
    />
  );
}
