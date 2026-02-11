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
type InternalProps = Props & {
  __layoutSegment?: string;
};

function getLayoutSegment(props: Props): string | undefined {
  return (props as InternalProps).__layoutSegment;
}

async function resolveMessages(
  layoutSegment: string | undefined
): Promise<ResolvedMessages> {
  if (!layoutSegment) {
    throw new Error(
      '[next-intl] `messages="infer"` requires an auto-injected `__layoutSegment`. This usually means the provider is not used in `app/**/layout.tsx`, tree-shaking is disabled, or the file is not compiled by Next.js.'
    );
  }

  const allMessages = await getMessages();
  const manifest = await loadTreeShakingManifest();
  if (!manifest) {
    return allMessages;
  }

  const inferredMessages = inferMessagesForSegment(
    allMessages as Record<string, unknown>,
    manifest,
    layoutSegment
  );
  return inferredMessages as ResolvedMessages;
}

export default async function NextIntlClientProviderServer(props: Props) {
  const layoutSegment = getLayoutSegment(props);
  const {formats, locale, messages, now, timeZone, ...rest} = props;

  let clientMessages;
  if (messages === undefined) {
    clientMessages = await getMessages();
  } else if (messages === 'infer') {
    clientMessages = await resolveMessages(layoutSegment);
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
  if (
    process.env.NODE_ENV !== 'production' &&
    messages === 'infer' &&
    clientMessages &&
    Object.keys(clientMessages).length > 0
  ) {
    return (
      <div style={{border: '1px solid green'}}>
        <pre
          data-id="provider-client-messages"
          style={{backgroundColor: 'lightgreen'}}
        >
          {JSON.stringify(clientMessages, null, 2)}
        </pre>
        {result}
      </div>
    );
  }

  return result;
}
