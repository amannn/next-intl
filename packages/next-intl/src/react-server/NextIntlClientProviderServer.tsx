import type {ComponentProps} from 'react';
import getConfigNow from '../server/react-server/getConfigNow.js';
import getFormats from '../server/react-server/getFormats.js';
import {getLocale, getMessages, getTimeZone} from '../server.react-server.js';
import BaseNextIntlClientProvider from '../shared/NextIntlClientProvider.js';
import {
  inferMessagesForSegment,
  loadTreeShakingManifest
} from '../tree-shaking/inferMessages.js';

type Props = ComponentProps<typeof BaseNextIntlClientProvider>;
type ResolvedMessages = Exclude<Props['messages'], 'infer'>;

async function resolveMessages(
  tempSegment: string | undefined
): Promise<ResolvedMessages> {
  const allMessages = await getMessages();
  const manifest = await loadTreeShakingManifest();
  if (!manifest) {
    return allMessages;
  }

  const inferredMessages = inferMessagesForSegment(
    allMessages as Record<string, unknown>,
    manifest,
    tempSegment ?? '/'
  );
  return inferredMessages as ResolvedMessages;
}

export default async function NextIntlClientProviderServer({
  formats,
  locale,
  messages,
  now,
  temp_segment,
  timeZone,
  ...rest
}: Props) {
  let clientMessages;
  if (messages === undefined) {
    clientMessages = await getMessages();
  } else if (messages === 'infer') {
    clientMessages = await resolveMessages(temp_segment);
  } else {
    clientMessages = messages;
  }

  const result = (
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

  // Temporary debugging
  if (process.env.NODE_ENV !== 'production' && messages === 'infer') {
    return (
      <div style={{border: '1px solid green'}}>
        <pre style={{backgroundColor: 'lightgreen'}}>
          {JSON.stringify(clientMessages, null, 2)}
        </pre>
        {result}
      </div>
    );
  }

  return result;
}
