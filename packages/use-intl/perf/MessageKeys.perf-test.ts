/**
 * Performance test for `NestedKeyOf`, `MessageKeys`, and `NamespaceKeys`.
 *
 * `BigMessages` has 1 200+ leaf keys across 11 ICU-variant sections and
 * three nesting levels. Values are concrete ICU string literals rather
 * than generic `string` so the type realistically mirrors a real-world
 * next-intl message catalog produced by `typeof messages`.
 */

import type {MessageKeys, NamespaceKeys, NestedKeyOf} from '../src/core/MessageKeys.js';
import type {TwoDigit} from './helpers.js';

/**
 * Canonical large message catalog used across perf tests.
 * Each section represents a distinct ICU notation variant; each has 100
 * keys generated via `TwoDigit` (00–99).
 */
export type BigMessages = {
  plain: {[K in TwoDigit as `msg_${K}`]: 'Hello, {name}!'};
  plural: {
    [K in TwoDigit as `msg_${K}`]: '{count, plural, =0 {nothing} one {# item} other {# items}}';
  };
  select: {
    [K in TwoDigit as `msg_${K}`]: '{gender, select, male {He} female {She} other {They}}';
  };
  ordinal: {
    [K in TwoDigit as `msg_${K}`]: '{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}';
  };
  number: {[K in TwoDigit as `msg_${K}`]: 'Progress: {value, number, percent}'};
  date: {[K in TwoDigit as `msg_${K}`]: 'Scheduled: {date, date, full}'};
  time: {[K in TwoDigit as `msg_${K}`]: 'At {time, time, short}'};
  rich: {[K in TwoDigit as `msg_${K}`]: 'Click <link>here</link> for details.'};
  markup: {[K in TwoDigit as `msg_${K}`]: '<b>Important</b>: {message}'};
  nested: {
    alpha: {
      [K in TwoDigit as `msg_${K}`]: '{alphaCount, plural, one {# alpha} other {# alphas}}';
    };
    beta: {[K in TwoDigit as `msg_${K}`]: '{betaValue, number}'};
  };
  deepNested: {
    level1: {
      level2: {[K in TwoDigit as `msg_${K}`]: 'Deep: {deepVal, date, short}'};
    };
  };
};

type AllPaths = NestedKeyOf<BigMessages>;
type MessageLeafKeys = MessageKeys<BigMessages, AllPaths>;
type NamespaceKeys_ = NamespaceKeys<BigMessages, AllPaths>;

type _ = [MessageLeafKeys, NamespaceKeys_] extends unknown ? true : false;
