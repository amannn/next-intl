import {memoize, Cache, strategies} from '@formatjs/fast-memoize';
// eslint-disable-next-line import/no-named-as-default -- False positive
import IntlMessageFormat from 'intl-messageformat';

export function createIntlCache() {
  return {
    dateTime: {} as Record<string, Intl.DateTimeFormat>,
    number: {} as Record<string, Intl.NumberFormat>,
    message: {} as Record<string, IntlMessageFormat>,
    relativeTime: {} as Record<string, Intl.RelativeTimeFormat>,
    pluralRules: {} as Record<string, Intl.PluralRules>,
    list: {} as Record<string, Intl.ListFormat>,
    displayNames: {} as Record<string, Intl.DisplayNames>
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

function memoFn<Fn extends (...args: Array<any>) => any>(
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

export function createFormatters(): {
  getDateTimeFormat(
    ...args: ConstructorParameters<typeof Intl.DateTimeFormat>
  ): Intl.DateTimeFormat;
  getNumberFormat(
    ...args: ConstructorParameters<typeof Intl.NumberFormat>
  ): Intl.NumberFormat;
  getPluralRules(
    ...args: ConstructorParameters<typeof Intl.PluralRules>
  ): Intl.PluralRules;
  getMessageFormat(
    ...args: ConstructorParameters<typeof IntlMessageFormat>
  ): IntlMessageFormat;
  getRelativeTimeFormat(
    ...args: ConstructorParameters<typeof Intl.RelativeTimeFormat>
  ): Intl.RelativeTimeFormat;
  getListFormat(
    ...args: ConstructorParameters<typeof Intl.ListFormat>
  ): Intl.ListFormat;
  getDisplayNames(
    ...args: ConstructorParameters<typeof Intl.DisplayNames>
  ): Intl.DisplayNames;
} {
  const cache = createIntlCache();

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
  const getMessageFormat = memoFn(
    (...args: ConstructorParameters<typeof IntlMessageFormat>) =>
      new IntlMessageFormat(args[0], args[1], args[2], {
        formatters: {
          // @ts-expect-error -- TS is currently lacking support for ECMA-402 10.0 (`useGrouping: 'auto'`, see https://github.com/microsoft/TypeScript/issues/56269)
          getNumberFormat,
          getDateTimeFormat,
          getPluralRules
        },
        ...args[3]
      }),
    cache.message
  );

  return {
    getDateTimeFormat,
    getNumberFormat,
    getPluralRules,
    getMessageFormat,
    getRelativeTimeFormat,
    getListFormat,
    getDisplayNames
  };
}

export type Formatters = ReturnType<typeof createFormatters>;
