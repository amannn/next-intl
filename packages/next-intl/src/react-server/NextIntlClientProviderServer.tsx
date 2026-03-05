import type {ComponentProps} from 'react';
import type {Messages} from 'use-intl';
import {warn} from '../node/utils.js';
import getConfigNow from '../server/react-server/getConfigNow.js';
import getFormats from '../server/react-server/getFormats.js';
import {getLocale, getMessages, getTimeZone} from '../server.react-server.js';
import BaseNextIntlClientProvider from '../shared/NextIntlClientProvider.js';
import {INFERRED_MANIFEST_PROP} from '../tree-shaking/config.js';
import type {
  ManifestNamespaceMap,
  ManifestNamespaces
} from '../tree-shaking/types.js';

type Props = ComponentProps<typeof BaseNextIntlClientProvider> & {
  [INFERRED_MANIFEST_PROP]?: ManifestNamespaces;
};

type ResolvedMessages = Exclude<Props['messages'], 'infer'>;

export default async function NextIntlClientProviderServer({
  formats,
  locale,
  messages,
  now,
  timeZone,
  [INFERRED_MANIFEST_PROP]: inferredManifest,
  ...rest
}: Props) {
  let clientMessages;
  if (messages === undefined) {
    clientMessages = await getMessages();
  } else if (messages === 'infer') {
    if (!inferredManifest) {
      if (process.env.NODE_ENV !== 'production') {
        warn(
          "`NextIntlClientProvider` didn't infer any client messages for this module."
        );
      }
      clientMessages = {} as ResolvedMessages;
    } else {
      const allMessages = await getMessages();
      clientMessages = pruneMessagesByManifestNamespaces(
        allMessages,
        inferredManifest
      ) as ResolvedMessages;
    }
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

function pruneMessagesByManifestNamespaces(
  messages: Messages,
  namespaces: ManifestNamespaces
) {
  function pruneNode(
    selector: ManifestNamespaceMap,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const output: Record<string, unknown> = {};

    for (const [key, nestedSelector] of Object.entries(selector)) {
      if (!(key in source)) continue;

      const value = source[key];
      if (nestedSelector === true) {
        output[key] = value;
        continue;
      }

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nested = pruneNode(
          nestedSelector,
          value as Record<string, unknown>
        );
        if (Object.keys(nested).length > 0) output[key] = nested;
        continue;
      }

      output[key] = value;
    }

    return output;
  }

  if (namespaces === true) return messages;
  return pruneNode(namespaces, messages);
}
