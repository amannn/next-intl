import type {ComponentProps} from 'react';
import getConfigNow from '../server/react-server/getConfigNow.js';
import getFormats from '../server/react-server/getFormats.js';
import {getLocale, getMessages, getTimeZone} from '../server.react-server.js';
import BaseNextIntlClientProvider from '../shared/NextIntlClientProvider.js';
import type {ManifestNamespaces} from '../tree-shaking/Manifest.js';
import {pruneMessagesByManifestNamespaces} from '../tree-shaking/inferMessages.js';

type Props = ComponentProps<typeof BaseNextIntlClientProvider> & {
  __inferredManifest?: ManifestNamespaces;
};

type ResolvedMessages = Exclude<Props['messages'], 'infer'>;

async function resolveMessages(
  inferredManifest: ManifestNamespaces | undefined
): Promise<ResolvedMessages> {
  if (!inferredManifest) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        "[next-intl] `NextIntlClientProvider` didn't infer any client messages for this module."
      );
    }
    return {} as ResolvedMessages;
  }
  const allMessages = await getMessages();
  return pruneMessagesByManifestNamespaces(
    allMessages as Record<string, unknown>,
    inferredManifest
  ) as ResolvedMessages;
}

export default async function NextIntlClientProviderServer({
  __inferredManifest,
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
    clientMessages = await resolveMessages(__inferredManifest);
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
