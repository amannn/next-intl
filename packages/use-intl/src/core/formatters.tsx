import {memoize, Cache, strategies} from '@formatjs/fast-memoize';
import type IntlMessageFormat from 'intl-messageformat';

export type IntlCache = {
  dateTime: Record<string, Intl.DateTimeFormat>;
  number: Record<string, Intl.NumberFormat>;
  message: Record<string, IntlMessageFormat>;
  relativeTime: Record<string, Intl.RelativeTimeFormat>;
  pluralRules: Record<string, Intl.PluralRules>;
  list: Record<string, Intl.ListFormat>;
  displayNames: Record<string, Intl.DisplayNames>;
};

export function createCache(): IntlCache {
  return {
    dateTime: {},
    number: {},
    message: {},
    relativeTime: {},
    pluralRules: {},
    list: {},
    displayNames: {}
  };
}

function createMemoCache<Value>(
  store: Record<string, Value | undefined>
): Cache<string, Value> {
  return {
    create() {
      return {
        get(key) {
          return store[key];
        },
        set(key, value) {
          store[key] = value;
        }
      };
    }
  };
}

export function memoFn<Fn extends (...args: Array<any>) => any>(
  fn: Fn,
  cache: Record<string, ReturnType<Fn> | undefined>
) {
  return memoize(fn, {
    cache: createMemoCache(cache),
    strategy: strategies.variadic
  }) as Fn;
}

function memoConstructor<Fn extends new (...args: Array<any>) => unknown>(
  ConstructorFn: Fn,
  cache: Record<string, InstanceType<Fn> | undefined>
) {
  return memoFn(
    (...args: ConstructorParameters<Fn>) => new ConstructorFn(...args),
    cache
  ) as (...args: ConstructorParameters<Fn>) => InstanceType<Fn>;
}

export type IntlFormatters = {
  getDateTimeFormat(
    ...args: ConstructorParameters<typeof Intl.DateTimeFormat>
  ): Intl.DateTimeFormat;
  getNumberFormat(
    ...args: ConstructorParameters<typeof Intl.NumberFormat>
  ): Intl.NumberFormat;
  getPluralRules(
    ...args: ConstructorParameters<typeof Intl.PluralRules>
  ): Intl.PluralRules;
  getRelativeTimeFormat(
    ...args: ConstructorParameters<typeof Intl.RelativeTimeFormat>
  ): Intl.RelativeTimeFormat;
  getListFormat(
    ...args: ConstructorParameters<typeof Intl.ListFormat>
  ): Intl.ListFormat;
  getDisplayNames(
    ...args: ConstructorParameters<typeof Intl.DisplayNames>
  ): Intl.DisplayNames;
};

export function createIntlFormatters(cache: IntlCache): IntlFormatters {
  const getDateTimeFormat = memoConstructor(
    Intl.DateTimeFormat,
    cache.dateTime
  );
  const getNumberFormat = memoConstructor(Intl.NumberFormat, cache.number);
  const getPluralRules = memoConstructor(Intl.PluralRules, cache.pluralRules);
  const getRelativeTimeFormat = memoConstructor(
    Intl.RelativeTimeFormat,
    cache.relativeTime
  );
  const getListFormat = memoConstructor(Intl.ListFormat, cache.list);
  const getDisplayNames = memoConstructor(
    Intl.DisplayNames,
    cache.displayNames
  );

  return {
    getDateTimeFormat,
    getNumberFormat,
    getPluralRules,
    getRelativeTimeFormat,
    getListFormat,
    getDisplayNames
  };
}

export type MessageFormatter = (
  ...args: ConstructorParameters<typeof IntlMessageFormat>
) => IntlMessageFormat;

export type Formatters = IntlFormatters & {
  getMessageFormat?: MessageFormatter;
};
