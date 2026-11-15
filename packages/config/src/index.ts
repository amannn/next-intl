type Locale = string;

type MessageReference = {
  path: string;
  line?: number;
  /** Orders references that share a line. Formats don't store it. */
  column?: number;
};

/** A single message that can be read from or written to a catalog. */
type Message = {
  id: string;
  message: string;
  /** E.g. multiple `#.` lines in PO. Empty when the format stores none. */
  description: Array<string>;
  /** E.g. `#:` lines in PO. Empty when the format stores none. */
  references: Array<MessageReference>;
  /** The message's path through its file: numbers are array indices. */
  segments?: Array<string | number>;
  /** A non-text value (e.g. a boolean) that is carried as-is, never translated. */
  verbatim?: {value: unknown};
  /** Marked by the format as no longer referenced in source code. */
  orphan?: boolean;
  /** Lets codec-private extras (e.g. PO flags) survive a decode/encode round-trip. */
  [key: string]: unknown;
};

/** A codec that reads and writes one messages file per locale. */
type SeparateFileCodec = {
  file?: 'separate';
  decode(
    content: string,
    context: {locale: Locale; sourceLocale: Locale}
  ): Array<Message>;
  encode(
    messages: Array<Message>,
    context: {locale: Locale; sourceMessagesById: Map<string, Message>}
  ): string;
};

/**
 * A codec for formats that keep every locale in one file (e.g. `.xcstrings`).
 * One instance serves one file: `decodeAll` runs before `encodeAll` whenever
 * the file exists, so closure state is how sibling locales survive a write.
 */
type SharedFileCodec = {
  file: 'shared';
  decodeAll(content: string): Record<Locale, Array<Message>>;
  /** Only changed locales are passed — others survive via closure state. */
  encodeAll(
    messagesByLocale: Record<Locale, Array<Message>>,
    context: {sourceLocale: Locale}
  ): string;
};

type Codec = SeparateFileCodec | SharedFileCodec;

/** Provides type safety for a codec factory. */
export function defineCodec<CodecType extends Codec>(
  factory: () => CodecType
): () => CodecType {
  return factory;
}
