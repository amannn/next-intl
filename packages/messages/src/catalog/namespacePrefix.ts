import type {ExtractorMessage} from '../types.js';

// A file loaded through a template with a captured `{namespace}` carries the
// namespace as an id prefix in memory (key `login.title` in `auth.json`
// becomes id `auth.login.title`), and the prefix is stripped again before
// encoding back to disk. Both directions live here so they can't drift apart.

const namespaceSeparator = '.';

export function addNamespacePrefix(
  messages: Array<ExtractorMessage>,
  namespace: string | undefined
): Array<ExtractorMessage> {
  if (namespace === undefined) return messages;
  const prefix = `${namespace}${namespaceSeparator}`;
  return messages.map((message) => ({
    ...message,
    id: `${prefix}${message.id}`
  }));
}

export function stripNamespacePrefix(
  messages: Array<ExtractorMessage>,
  namespace: string | undefined
): Array<ExtractorMessage> {
  if (namespace === undefined) return messages;
  const prefix = `${namespace}${namespaceSeparator}`;
  return messages.map((message) =>
    message.id.startsWith(prefix)
      ? {...message, id: message.id.slice(prefix.length)}
      : message
  );
}
