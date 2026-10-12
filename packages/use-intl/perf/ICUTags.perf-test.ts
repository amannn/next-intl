/**
 * Performance test for `ICUTags<MessageString, TagsFn>`.
 *
 * Two layers of coverage:
 *  - Spot checks — one message per structural tag pattern; each `Assert`
 *    resolving to `never` signals a type regression.
 *  - Bulk instantiation — 100 unique tag names per pattern via `TwoDigit`;
 *    distinct tag names force a fresh recursive conditional per message.
 */

import type ICUTags from '../src/core/ICUTags.js';
import type {
  MarkupTagsFunction,
  RichTagsFunction
} from '../src/core/TranslationValues.js';
import type {Assert, TwoDigit} from './helpers.js';

// ── Spot checks ───────────────────────────────────────────────────────────────

type AssertSingleTag = Assert<
  ICUTags<'Click <link>here</link> for help.', RichTagsFunction>,
  {link: RichTagsFunction}
>;
type AssertSiblingTags = Assert<
  ICUTags<'<b>Bold</b> and <i>italic</i> text.', RichTagsFunction>,
  {b: RichTagsFunction; i: RichTagsFunction}
>;
type AssertNestedTags = Assert<
  ICUTags<'<outer><inner>text</inner></outer>', RichTagsFunction>,
  {outer: RichTagsFunction; inner: RichTagsFunction}
>;
type AssertTagWithParam = Assert<
  ICUTags<'Hello <strong>{name}</strong>!', RichTagsFunction>,
  {strong: RichTagsFunction}
>;
type AssertTagInPlural = Assert<
  ICUTags<
    '{count, plural, one {<b># item</b>} other {<b># items</b>}}',
    RichTagsFunction
  >,
  {b: RichTagsFunction}
>;
type AssertTripleTags = Assert<
  ICUTags<'<a>one</a>, <b>two</b>, and <c>three</c>.', RichTagsFunction>,
  {a: RichTagsFunction; b: RichTagsFunction; c: RichTagsFunction}
>;
type AssertMarkupTags = Assert<
  ICUTags<
    'Accept the <bold>terms</bold> and <em>conditions</em>.',
    MarkupTagsFunction
  >,
  {bold: MarkupTagsFunction; em: MarkupTagsFunction}
>;
type AssertNoTags = Assert<
  ICUTags<'Plain text with {param} only.', RichTagsFunction>,
  Record<string, never>
>;

// ── Bulk instantiation ────────────────────────────────────────────────────────

type BulkSingleTag = {
  [K in TwoDigit]: ICUTags<
    `Click <link${K}>here</link${K}>.`,
    RichTagsFunction
  >;
};
type BulkSiblingTags = {
  [K in TwoDigit]: ICUTags<
    `<a${K}>first</a${K}> and <b${K}>second</b${K}>.`,
    RichTagsFunction
  >;
};
type BulkNestedTags = {
  [K in TwoDigit]: ICUTags<
    `<outer${K}><inner${K}>deep</inner${K}></outer${K}>`,
    RichTagsFunction
  >;
};
type BulkTagWithParam = {
  [K in TwoDigit]: ICUTags<
    `Hello <em${K}>{name${K}}</em${K}>!`,
    RichTagsFunction
  >;
};

type _ = [
  AssertSingleTag,
  AssertSiblingTags,
  AssertNestedTags,
  AssertTagWithParam,
  AssertTagInPlural,
  AssertTripleTags,
  AssertMarkupTags,
  AssertNoTags,
  BulkSingleTag,
  BulkSiblingTags,
  BulkNestedTags,
  BulkTagWithParam
] extends unknown
  ? true
  : false;
