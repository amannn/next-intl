import type {defineCodec} from '@eloqnt/config';
import type {ExtractorMessage, Locale} from '../types.js';

// Unlike `ExtractorCodec`, which is the per-locale codec next-intl's loader
// accepts, this covers both file layouts
export type MessagesCodec = ReturnType<ReturnType<typeof defineCodec>>;
export type SeparateFileCodec = Extract<MessagesCodec, {decode: unknown}>;
export type SharedFileCodec = Extract<MessagesCodec, {file: 'shared'}>;

export type Catalog = {
  locale: Locale;
  /** Absent when the locale has no file. */
  file?: string;
  messages: Array<ExtractorMessage>;
  /**
   * The instance this catalog was decoded with, so a write-back keeps the
   * file's round-trip state (e.g. PO header metadata). Absent on a catalog
   * merged across files, and on a shared-file catalog, where the group owns
   * the file's codec instance.
   */
  codec?: SeparateFileCodec;
};

/** Catalogs that share a path template (and namespace, if any). */
export type CatalogGroup = {
  /** The path template the user wrote. */
  path: string;
  /** Captured by a `{namespace}` token. */
  namespace?: string;
  byLocale: Map<Locale, Catalog>;
  /** The file of a (possibly new) locale in this group. */
  resolveFile(locale: Locale): string;
  /**
   * The one file every locale of a shared-file group lives in, and the codec
   * instance that decoded it. A write must encode with that same instance, so
   * unchanged locales and unknown fields survive.
   */
  shared?: {file: string; codec: SharedFileCodec};
};

export type LoadedCatalogs = {
  /** Merged across groups: the source first, then each target. */
  catalogs: Array<Catalog>;
  /** So a writer can route each message back to the file it came from. */
  groups: Array<CatalogGroup>;
};
