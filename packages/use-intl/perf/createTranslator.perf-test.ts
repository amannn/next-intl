/**
 * Performance test for `Translator<T, Namespace>` from `createTranslator`.
 *
 * Each key maps to a *unique* ICU string literal (unique param/tag names per
 * key index), so TypeScript cannot reuse cached `ICUArgs` instantiations.
 * This stresses the full type chain on every `t(key, values)` call:
 *
 *   Translator → NamespacedMessageKeys → MessageKeys → NestedKeyOf
 *                        ↓ (on key access)
 *              TranslateArgs → ICUArgsWithTags → ICUArgs → GetICUArgs
 *
 * Uses `Digit` (10 keys) rather than `TwoDigit` (100 keys) because the
 * translator test couples key count with actual call-site type-checking,
 * which scales more aggressively than a simple mapped type.
 */

import type {Translator} from '../src/core/createTranslator.js';
import type {Digit} from './helpers.js';

export type TranslatorMessages = {
  plain: {[K in Digit as `msg_${K}`]: `Hello, {name${K}}!`};
  plural: {
    [K in Digit as `msg_${K}`]: `{count${K}, plural, =0 {nothing} one {# item} other {# items}}`;
  };
  select: {
    [K in Digit as `msg_${K}`]: `{gender${K}, select, male {He} female {She} other {They}}`;
  };
  ordinal: {
    [K in Digit as `msg_${K}`]: `{n${K}, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}`;
  };
  number: {
    [K in Digit as `msg_${K}`]: `Progress: {value${K}, number, percent}`;
  };
  date: {[K in Digit as `msg_${K}`]: `Scheduled: {date${K}, date, full}`};
  time: {[K in Digit as `msg_${K}`]: `At {time${K}, time, short}`};
  rich: {
    [K in Digit as `msg_${K}`]: `Click <link${K}>here</link${K}> for details.`;
  };
  mixed: {
    [K in Digit as `msg_${K}`]: `{count${K}, plural, one {<b${K}># item</b${K}>} other {<b${K}># items</b${K}>}}`;
  };
};

declare const tPlain: Translator<TranslatorMessages, 'plain'>;
declare const tPlural: Translator<TranslatorMessages, 'plural'>;
declare const tSelect: Translator<TranslatorMessages, 'select'>;
declare const tOrdinal: Translator<TranslatorMessages, 'ordinal'>;
declare const tNumber: Translator<TranslatorMessages, 'number'>;
declare const tDate: Translator<TranslatorMessages, 'date'>;
declare const tTime: Translator<TranslatorMessages, 'time'>;
declare const tRich: Translator<TranslatorMessages, 'rich'>;
declare const tMixed: Translator<TranslatorMessages, 'mixed'>;

// Each call exercises the full overload resolution + ICUArgs chain for a
// different ICU variant. Two calls per plural-like variant exercise distinct
// cached instantiation paths.
const _p0 = tPlain('msg_0', {name0: 'Alice'});
const _p1 = tPlain('msg_1', {name1: 'Bob'});
const _pl0 = tPlural('msg_0', {count0: 1});
const _pl1 = tPlural('msg_1', {count1: 5});
const _s0 = tSelect('msg_0', {gender0: 'male'});
const _o0 = tOrdinal('msg_0', {n0: 1});
const _n0 = tNumber('msg_0', {value0: 0.75});
const _d0 = tDate('msg_0', {date0: new Date()});
const _t0 = tTime('msg_0', {time0: new Date()});
const _ri0: unknown = tRich.rich('msg_0', {link0: (c) => c});
const _m0 = tMixed('msg_0', {count0: 1});

void [_p0, _p1, _pl0, _pl1, _s0, _o0, _n0, _d0, _t0, _ri0, _m0];
