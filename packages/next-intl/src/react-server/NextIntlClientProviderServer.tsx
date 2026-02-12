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

async function resolveMessages(
  layoutSegment: string | undefined
): Promise<ResolvedMessages> {
  if (!layoutSegment) {
    throw new Error(
      '[next-intl] `<NextIntlClientProvider messages="infer" /> was used, but wasn\'t compiled.\n\nThis usually means:\n' +
        "- The provider is not placed in `app/**/layout.tsx` (that's the only place it can be used)" +
        "- You don't have `experimental.treeShaking` enabled" +
        `- You're not using Next.js for compiling your code (e.g. for test runners, pass \`messages\` explicitly)`
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
    const layoutSegment = (rest as InternalProps).__layoutSegment;
    clientMessages = await resolveMessages(layoutSegment);
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
