import type {ExtractorMessage, ExtractorMessageReference} from './types.js';

export function getSortedMessages(
  messages: Array<ExtractorMessage>
): Array<ExtractorMessage> {
  return messages.toSorted((messageA, messageB) => {
    const refA = messageA.references?.[0];
    const refB = messageB.references?.[0];

    // No references: preserve original (extraction) order
    if (!refA || !refB) return 0;

    // Sort by path, then line. Same path+line: preserve original order
    return compareReferences(refA, refB);
  });
}

export function localeCompare(a: string, b: string) {
  return a.localeCompare(b, 'en');
}

export function compareReferences(
  refA: ExtractorMessageReference,
  refB: ExtractorMessageReference
): number {
  const pathCompare = localeCompare(refA.path, refB.path);
  if (pathCompare !== 0) return pathCompare;
  return (refA.line ?? 0) - (refB.line ?? 0);
}
