/**
 * Performance test for `ICUArgs<Message, Options>`.
 *
 * Two layers of coverage:
 *  - Spot checks — one canonical message per ICU variant; each `Assert`
 *    resolving to `never` signals a type regression.
 *  - Bulk instantiation — 100 unique ICU strings per variant via `TwoDigit`;
 *    unique param names prevent structural caching in `GetICUArgs`.
 */

import type ICUArgs from '../src/core/ICUArgs.js';
import type {Assert, ICUArgOpts, TwoDigit} from './helpers.js';

// ── Spot checks ───────────────────────────────────────────────────────────────

type AssertPlain = Assert<
  ICUArgs<'Hello, {name}!', ICUArgOpts>,
  {name: string}
>;
type AssertPlural = Assert<
  ICUArgs<
    '{count, plural, =0 {nothing} one {# item} other {# items}}',
    ICUArgOpts
  >,
  {count: number | bigint}
>;
type AssertSelect = Assert<
  ICUArgs<'{gender, select, male {He} female {She} other {They}}', ICUArgOpts>,
  {gender: string}
>;
type AssertOrdinal = Assert<
  ICUArgs<
    '{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}',
    ICUArgOpts
  >,
  {n: number | bigint}
>;
type AssertNumber = Assert<
  ICUArgs<'Progress: {value, number, percent}', ICUArgOpts>,
  {value: number | bigint}
>;
type AssertDate = Assert<
  ICUArgs<'Scheduled: {date, date, full}', ICUArgOpts>,
  {date: Date}
>;
type AssertTime = Assert<
  ICUArgs<'At {time, time, short}', ICUArgOpts>,
  {time: Date}
>;
type AssertDateSkeleton = Assert<
  ICUArgs<'Born: {date, date, ::yyyyMMMd}', ICUArgOpts>,
  {date: Date}
>;
type AssertCombined = Assert<
  ICUArgs<
    '{count, plural, one {{name} won # item} other {{name} won # items}}',
    ICUArgOpts
  >,
  {count: number | bigint; name: string}
>;
type AssertNested = Assert<
  ICUArgs<
    '{count, plural, one {{gender, select, male {He won} female {She won} other {They won}} # item} other {# items}}',
    ICUArgOpts
  >,
  {count: number | bigint; gender: string}
>;

// ── Bulk instantiation ────────────────────────────────────────────────────────

type BulkPlain = {[K in TwoDigit]: ICUArgs<`Hello, {name${K}}!`, ICUArgOpts>};
type BulkPlural = {
  [K in TwoDigit]: ICUArgs<
    `{count${K}, plural, =0 {nothing} one {# item} other {# items}}`,
    ICUArgOpts
  >;
};
type BulkSelect = {
  [K in TwoDigit]: ICUArgs<
    `{gender${K}, select, male {He} female {She} other {They}}`,
    ICUArgOpts
  >;
};
type BulkOrdinal = {
  [K in TwoDigit]: ICUArgs<
    `{n${K}, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}`,
    ICUArgOpts
  >;
};
type BulkNumber = {
  [K in TwoDigit]: ICUArgs<
    `Progress: {value${K}, number, percent}`,
    ICUArgOpts
  >;
};
type BulkDate = {
  [K in TwoDigit]: ICUArgs<`Scheduled: {date${K}, date, full}`, ICUArgOpts>;
};
type BulkTime = {
  [K in TwoDigit]: ICUArgs<`At {time${K}, time, short}`, ICUArgOpts>;
};
type BulkCombined = {
  [K in TwoDigit]: ICUArgs<
    `{count${K}, plural, one {{name${K}} won # item} other {{name${K}} won # items}}`,
    ICUArgOpts
  >;
};

type _ = [
  AssertPlain,
  AssertPlural,
  AssertSelect,
  AssertOrdinal,
  AssertNumber,
  AssertDate,
  AssertTime,
  AssertDateSkeleton,
  AssertCombined,
  AssertNested,
  BulkPlain,
  BulkPlural,
  BulkSelect,
  BulkOrdinal,
  BulkNumber,
  BulkDate,
  BulkTime,
  BulkCombined
] extends unknown
  ? true
  : false;
