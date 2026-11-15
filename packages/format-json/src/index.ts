import {defineCodec} from '@eloqnt/config';

/** A message's path through its file: numbers are array indices. */
type ValueSegments = Array<string | number>;

// Retained per locale so a decode/encode round-trip reproduces them: nulls
// and empty containers hold no translatable content, so they produce no
// messages — without retention, encode would delete them from the file.
type RetainedValue = {
  segments: ValueSegments;
  value: null | Array<never> | Record<string, never>;
};

export default defineCodec(() => {
  const retainedByLocale = new Map<string, Array<RetainedValue>>();

  return {
    decode(content, context) {
      // A blank file is a new, empty catalog (e.g. created to receive a
      // new locale).
      if (content.trim() === '') {
        retainedByLocale.set(context.locale, []);
        return [];
      }

      const root: unknown = JSON.parse(content);
      if (root === null || typeof root !== 'object' || Array.isArray(root)) {
        throw new Error('The top level of a messages file must be an object.');
      }

      function toMessage(
        id: string,
        message: string,
        segments: ValueSegments,
        verbatim?: {value: boolean | number}
      ) {
        return {
          id,
          message,
          references: [],
          description: [],
          segments,
          ...(verbatim && {verbatim})
        };
      }

      const messages: Array<ReturnType<typeof toMessage>> = [];
      const retained: Array<RetainedValue> = [];

      function traverse(
        node: Record<string, unknown> | Array<unknown>,
        path: ValueSegments
      ): void {
        const entries: Array<[string | number, unknown]> = Array.isArray(node)
          ? node.map((value, index): [number, unknown] => [index, value])
          : Object.keys(node).map((key): [string, unknown] => [key, node[key]]);

        if (entries.length === 0 && path.length > 0) {
          retained.push({segments: path, value: Array.isArray(node) ? [] : {}});
          return;
        }

        for (const [key, value] of entries) {
          const segments = [...path, key];
          const id = segments.join('.');
          if (typeof value === 'string') {
            messages.push(toMessage(id, value, segments));
          } else if (typeof value === 'boolean' || typeof value === 'number') {
            messages.push(
              toMessage(id, JSON.stringify(value), segments, {value})
            );
          } else if (value === null) {
            // Absent, not content: some catalogs write `null` for
            // never-translated entries, and a null element would deadlock an
            // array (present, so never "missing", so never translated).
            // Retained for the file's own round-trip, never propagated.
            retained.push({segments, value: null});
          } else {
            traverse(
              value as Record<string, unknown> | Array<unknown>,
              segments
            );
          }
        }
      }

      traverse(root as Record<string, unknown>, []);
      retainedByLocale.set(context.locale, retained);
      return messages;
    },

    encode(messages, context) {
      type Message = (typeof messages)[number];

      // The `segments` a message decoded with, when a codec recorded them.
      function getSegments(message: Message): ValueSegments | undefined {
        const value = message.segments;
        if (
          Array.isArray(value) &&
          value.every(
            (segment) =>
              typeof segment === 'string' || typeof segment === 'number'
          )
        ) {
          return value;
        }
        return undefined;
      }

      // The legacy flat shape — `verbatim: true` with the value in a `value`
      // sibling — is accepted alongside the current `verbatim: {value}`.
      function isVerbatim(message: Message): boolean {
        const verbatim: unknown = message.verbatim;
        return (
          (typeof verbatim === 'object' && verbatim !== null) ||
          verbatim === true
        );
      }

      function getVerbatimValue(message: Message): unknown {
        const verbatim: unknown = message.verbatim;
        if (typeof verbatim === 'object' && verbatim !== null) {
          return (verbatim as {value: unknown}).value;
        }
        return message.value;
      }

      // A message's path, from the most reliable carrier available: its own
      // decoded segments (trusted only when they still spell the id — stale
      // segments ride along when a message is renamed by spreading the old
      // one); the source message's; or the id, split on dots.
      function resolveSegments(message: Message): ValueSegments {
        const own = getSegments(message);
        if (own && own.join('.') === message.id) return own;
        const source = context.sourceMessagesById.get(message.id);
        if (source) {
          const sourceSegments = getSegments(source);
          if (sourceSegments && sourceSegments.join('.') === message.id) {
            return sourceSegments;
          }
        }
        return message.id.split('.');
      }

      // Sorts like next-intl's extractor: by first reference path, then line.
      function compareByReference(a: Message, b: Message): number {
        const refA = a.references[0];
        const refB = b.references[0];
        if (!refA || !refB) return 0;
        const pathCompare = refA.path.localeCompare(refB.path, 'en');
        if (pathCompare !== 0) return pathCompare;
        return (refA.line ?? 0) - (refB.line ?? 0);
      }

      const root = Object.create(null) as Record<string, unknown>;
      for (const message of messages.toSorted(compareByReference)) {
        const value = isVerbatim(message)
          ? getVerbatimValue(message)
          : message.message;
        setValue(root, resolveSegments(message), value);
      }
      for (const {segments, value} of retainedByLocale.get(context.locale) ??
        []) {
        setValueIfAbsent(root, segments, value);
      }
      return JSON.stringify(root, null, 2) + '\n';
    }
  };
});

/**
 * Places a value at its segments, creating containers along the way — an
 * array when the next segment is a number, an object otherwise. On a shape
 * conflict the structured write wins (source structure is the schema): a
 * container replaces a mismatching value, and a leaf arriving where a
 * container already stands is dropped.
 */
function setValue(
  root: Record<string, unknown>,
  segments: ValueSegments,
  value: unknown
): void {
  let current: Record<string, unknown> | Array<unknown> = root;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const wantsArray = typeof segments[i + 1] === 'number';
    let next = (current as Record<string, unknown>)[segment as string];
    if (
      next === null ||
      typeof next !== 'object' ||
      Array.isArray(next) !== wantsArray
    ) {
      next = wantsArray ? [] : Object.create(null);
      (current as Record<string, unknown>)[segment as string] = next;
    }
    current = next as Record<string, unknown> | Array<unknown>;
  }
  const last = segments[segments.length - 1];
  const existing = (current as Record<string, unknown>)[last as string];
  if (existing !== null && typeof existing === 'object') return;
  (current as Record<string, unknown>)[last as string] = value;
}

/** `setValue`, except an occupied path is left untouched. */
function setValueIfAbsent(
  root: Record<string, unknown>,
  segments: ValueSegments,
  value: unknown
): void {
  let current: Record<string, unknown> | Array<unknown> = root;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const next = (current as Record<string, unknown>)[segment as string];
    if (next === null || typeof next !== 'object') {
      if (next !== undefined) return;
      const container =
        typeof segments[i + 1] === 'number' ? [] : Object.create(null);
      (current as Record<string, unknown>)[segment as string] = container;
      current = container as Record<string, unknown> | Array<unknown>;
    } else {
      current = next as Record<string, unknown> | Array<unknown>;
    }
  }
  const last = segments[segments.length - 1];
  if ((current as Record<string, unknown>)[last as string] !== undefined) {
    return;
  }
  (current as Record<string, unknown>)[last as string] = value;
}
