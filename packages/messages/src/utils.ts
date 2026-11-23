import type {ExtractorMessage} from './types.js';

export function warnAboutMissingReferences(
  messages: Array<ExtractorMessage>,
  warn: (message: string) => void
): void {
  const warnedIds = new Set<string>();
  for (const message of messages) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (message.references[0] == null && !warnedIds.has(message.id)) {
      warnedIds.add(message.id);
      warn(`Missing file reference for extracted message: ${message.id}`);
    }
  }
}
