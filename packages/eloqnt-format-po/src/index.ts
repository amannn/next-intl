import {defineCodec} from '@eloqnt/config';
import POParser, {type Entry} from 'po-parser';

/**
 * The layouts the codec can round-trip. Files identify their own layout and
 * are written back in the layout they were read in, so a catalog only changes
 * shape through an explicit migration. New files use `'key-msgctxt'`:
 *
 * - `'key-msgctxt'`: this package's format — source text in `msgid`, the
 *   complete message id in `msgctxt`, the translation in `msgstr` (source
 *   locale: the source text, as gettext's `msgen` does).
 * - `'id-msgid'`: the previous built-in format of next-intl and eloqnt — the
 *   id in `msgid` (namespace split into `msgctxt`), text in `msgstr`.
 * - `'gettext'`: plain gettext files from other tools (e.g. Lingui) — the
 *   source text is itself the id, `msgctxt` is a disambiguator, and a source
 *   catalog's `msgstr` may be empty.
 */
type Shape = 'key-msgctxt' | 'id-msgid' | 'gettext';

const KEY_HEADER = 'X-Message-Key';
const LEGACY_HEADER = 'X-Crowdin-SourceKey';

// Codec-private round-trip markers, carried via the message's index signature.
const EMPTY_SOURCE = 'formatPoEmptySource';
const CONTEXT = 'formatPoContext';

// See https://www.gnu.org/software/gettext/manual/html_node/Header-Entry.html
const DEFAULT_METADATA = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Content-Transfer-Encoding': '8bit',
  'X-Generator': '@eloqnt/format-po'
};

// The previous built-in format splits a namespaced id at the last dot.
const NAMESPACE_SEPARATOR = '.';

function detectShape(meta: Record<string, string> | undefined): Shape {
  if (meta?.[LEGACY_HEADER] === 'msgstr') return 'id-msgid';
  if (meta?.[KEY_HEADER] === 'msgctxt') return 'key-msgctxt';
  return 'gettext';
}

/** Path-only refs (no `:line`), deduplicated, to minimize diffs. */
function pathOnlyReferences(
  references: Array<{path: string; line?: number}>
): Array<{path: string}> {
  return [...new Set(references.map((ref) => ref.path))].map((path) => ({
    path
  }));
}

export default defineCodec(() => {
  const shapeByLocale = new Map<string, Shape>();
  const metadataByLocale = new Map<string, Record<string, string>>();
  const lineReferencesByLocale = new Map<string, boolean>();

  return {
    decode(content, context) {
      const catalog = POParser.parse(content);
      // A blank file carries no layout to preserve — it counts as new.
      if (catalog.meta || (catalog.messages ?? []).length > 0) {
        shapeByLocale.set(context.locale, detectShape(catalog.meta));
        lineReferencesByLocale.set(
          context.locale,
          (catalog.messages ?? []).some((entry) =>
            entry.references?.some((ref) => ref.line !== undefined)
          )
        );
      }
      const shape = shapeByLocale.get(context.locale) ?? 'key-msgctxt';
      if (catalog.meta) {
        metadataByLocale.set(context.locale, catalog.meta);
      }

      return (catalog.messages ?? []).map((entry) => {
        const {extractedComments, msgctxt, msgid, msgstr, references, ...rest} =
          entry;

        const id =
          shape === 'key-msgctxt'
            ? (msgctxt ?? msgid)
            : // Elsewhere, identity is the (msgctxt, msgid) pair.
              msgctxt
              ? [msgctxt, msgid].join(NAMESPACE_SEPARATOR)
              : msgid;

        // An empty `msgstr` reads as the source text in the source locale and
        // as a missing translation anywhere else, so it needs the source
        // locale to be attributed. The `'id-msgid'` shape never falls back.
        const isEmptyMessage = shape !== 'id-msgid' && msgstr === '';
        if (isEmptyMessage && !context.sourceLocale) {
          throw new Error(
            `Found an empty msgstr in the "${context.locale}" messages file, but no source locale is known. An empty msgstr can mean that the translation is missing, or that it matches the source text, and only the source locale tells the two apart. Set \`sourceLocale\` in your config to the locale your source messages are written in.`
          );
        }
        const isEmptySource =
          isEmptyMessage && context.locale === context.sourceLocale;

        return {
          ...rest,
          id,
          message: isEmptySource ? msgid : msgstr,
          description: extractedComments ?? [],
          references: references ?? [],
          ...(shape === 'gettext' && msgctxt && {[CONTEXT]: msgctxt}),
          ...(isEmptySource && {[EMPTY_SOURCE]: msgid})
        };
      });
    },

    encode(messages, context) {
      type Message = (typeof messages)[number];

      const shape = shapeByLocale.get(context.locale) ?? 'key-msgctxt';
      const retained = metadataByLocale.get(context.locale) ?? {};
      // A file that already carries `path:line` references keeps them as-is —
      // rewriting another tool's reference style would churn every entry.
      const encodeReferences = lineReferencesByLocale.get(context.locale)
        ? (references: Array<{path: string; line?: number}>) => references
        : pathOnlyReferences;

      function encodeEntry(message: Message): Entry {
        const {
          description,
          id,
          message: text,
          references,
          [EMPTY_SOURCE]: emptySource,
          [CONTEXT]: gettextContext,
          ...rest
        } = message;

        if (shape === 'id-msgid') {
          const lastDotIndex = id.lastIndexOf(NAMESPACE_SEPARATOR);
          const hasNamespace = id.includes(NAMESPACE_SEPARATOR);
          return {
            ...rest,
            msgid: hasNamespace
              ? id.slice(lastDotIndex + NAMESPACE_SEPARATOR.length)
              : id,
            msgstr: text,
            ...(description.length > 0 && {extractedComments: description}),
            ...(hasNamespace && {msgctxt: id.slice(0, lastDotIndex)}),
            ...(encodeReferences(references).length > 0 && {
              references: encodeReferences(references)
            })
          };
        }

        // A gettext disambiguator must not become an id in a managed file.
        const context_ =
          shape === 'gettext' && typeof gettextContext === 'string'
            ? gettextContext
            : undefined;
        let msgid = context.sourceMessagesById.get(id)?.message;
        if (msgid === undefined) {
          if (shape === 'gettext') {
            // The id is derived from the entry, so it can be mapped back.
            msgid = context_ ? id.slice(context_.length + 1) : id;
          } else {
            throw new Error(
              `Missing source message for id "${id}" while encoding "${context.locale}".`
            );
          }
        }

        // An unchanged empty-source entry writes back as empty.
        const msgstr =
          emptySource !== undefined && text === emptySource ? '' : text;

        let msgctxt;
        if (shape === 'gettext') {
          // A fresh entry has no marker; recover the disambiguator from the id.
          msgctxt =
            context_ ??
            (id !== msgid && id.endsWith(`.${msgid}`)
              ? id.slice(0, -(msgid.length + 1))
              : undefined);
        } else {
          msgctxt = id === msgid ? undefined : id;
        }

        return {
          ...rest,
          msgid,
          msgstr,
          ...(description.length > 0 && {extractedComments: description}),
          ...(msgctxt !== undefined && {msgctxt}),
          ...(encodeReferences(references).length > 0 && {
            references: encodeReferences(references)
          })
        };
      }

      // Sorts like next-intl's extractor: by first reference path, then line,
      // then column. Without a column (e.g. references read from a file),
      // ties keep their input order.
      function compareByReference(a: Message, b: Message): number {
        const refA = a.references[0];
        const refB = b.references[0];
        if (!refA || !refB) return 0;
        const pathCompare = refA.path.localeCompare(refB.path, 'en');
        if (pathCompare !== 0) return pathCompare;
        return (
          (refA.line ?? 0) - (refB.line ?? 0) ||
          (refA.column ?? 0) - (refB.column ?? 0)
        );
      }

      // Foreign gettext files keep their order and headers untouched.
      const sorted =
        shape === 'gettext' ? messages : messages.toSorted(compareByReference);

      let meta: Record<string, string>;
      if (shape === 'gettext') {
        // Keep the header's own key order — hoisting `Language` to the front
        // would touch every foreign file on its first write.
        meta =
          'Language' in retained
            ? retained
            : {Language: context.locale, ...retained};
      } else if (shape === 'id-msgid') {
        meta = {
          Language: context.locale,
          ...DEFAULT_METADATA,
          [LEGACY_HEADER]: 'msgstr',
          ...retained
        };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {[LEGACY_HEADER]: _, ...withoutLegacyHeader} = retained;
        meta = {
          Language: context.locale,
          ...DEFAULT_METADATA,
          ...withoutLegacyHeader,
          [KEY_HEADER]: 'msgctxt'
        };
      }

      return POParser.serialize({
        meta,
        messages: sorted.map(encodeEntry)
      });
    }
  };
});
