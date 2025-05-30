import type {ReactElement} from 'react';
import type {FormatNames, Locale} from './AppConfig.js';
import type DateTimeFormatOptions from './DateTimeFormatOptions.js';
import type Formats from './Formats.js';
import IntlError from './IntlError.js';
import IntlErrorCode from './IntlErrorCode.js';
import type NumberFormatOptions from './NumberFormatOptions.js';
import type RelativeTimeFormatOptions from './RelativeTimeFormatOptions.js';
import type TimeZone from './TimeZone.js';
import {defaultOnError} from './defaults.js';
import {
  type Formatters,
  type IntlCache,
  createCache,
  createIntlFormatters
} from './formatters.js';

const SECOND = 1;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * (365 / 12); // Approximation
const QUARTER = MONTH * 3;
const YEAR = DAY * 365;

const UNIT_SECONDS: Record<Intl.RelativeTimeFormatUnit, number> = {
  second: SECOND,
  seconds: SECOND,
  minute: MINUTE,
  minutes: MINUTE,
  hour: HOUR,
  hours: HOUR,
  day: DAY,
  days: DAY,
  week: WEEK,
  weeks: WEEK,
  month: MONTH,
  months: MONTH,
  quarter: QUARTER,
  quarters: QUARTER,
  year: YEAR,
  years: YEAR
} as const;

function resolveRelativeTimeUnit(seconds: number) {
  const absValue = Math.abs(seconds);

  if (absValue < MINUTE) {
    return 'second';
  } else if (absValue < HOUR) {
    return 'minute';
  } else if (absValue < DAY) {
    return 'hour';
  } else if (absValue < WEEK) {
    return 'day';
  } else if (absValue < MONTH) {
    return 'week';
  } else if (absValue < YEAR) {
    return 'month';
  }
  return 'year';
}

function calculateRelativeTimeValue(
  seconds: number,
  unit: Intl.RelativeTimeFormatUnit
) {
  // We have to round the resulting values, as `Intl.RelativeTimeFormat`
  // will include fractions like '2.1 hours ago'.
  return Math.round(seconds / UNIT_SECONDS[unit]);
}

type Props = {
  locale: Locale;
  timeZone?: TimeZone;
  onError?(error: IntlError): void;
  formats?: Formats;
  now?: Date;
  /** @private */
  _formatters?: Formatters;
  /** @private */
  _cache?: IntlCache;
};

export default function createFormatter(props: Props) {
  const {
    _cache: cache = createCache(),
    _formatters: formatters = createIntlFormatters(cache),
    formats,
    locale,
    onError = defaultOnError,
    timeZone: globalTimeZone
  } = props;

  function applyTimeZone(options?: DateTimeFormatOptions) {
    if (!options?.timeZone) {
      if (globalTimeZone) {
        options = {...options, timeZone: globalTimeZone};
      } else {
        onError(
          new IntlError(
            IntlErrorCode.ENVIRONMENT_FALLBACK,
            process.env.NODE_ENV !== 'production'
              ? `The \`timeZone\` parameter wasn't provided and there is no global default configured. Consider adding a global default to avoid markup mismatches caused by environment differences. Learn more: https://next-intl.dev/docs/configuration#time-zone`
              : undefined
          )
        );
      }
    }

    return options;
  }

  function resolveFormatOrOptions<Options>(
    typeFormats: Record<string, Options> | undefined,
    formatOrOptions?: string | Options,
    overrides?: Options
  ) {
    let options;
    if (typeof formatOrOptions === 'string') {
      const formatName = formatOrOptions;
      options = typeFormats?.[formatName];

      if (!options) {
        const error = new IntlError(
          IntlErrorCode.MISSING_FORMAT,
          process.env.NODE_ENV !== 'production'
            ? `Format \`${formatName}\` is not available.`
            : undefined
        );
        onError(error);
        throw error;
      }
    } else {
      options = formatOrOptions;
    }

    if (overrides) {
      options = {...options, ...overrides};
    }

    return options;
  }

  function getFormattedValue<Options, Output>(
    formatOrOptions: string | Options | undefined,
    overrides: Options | undefined,
    typeFormats: Record<string, Options> | undefined,
    formatter: (options?: Options) => Output,
    getFallback: () => Output
  ) {
    let options;
    try {
      options = resolveFormatOrOptions(typeFormats, formatOrOptions, overrides);
    } catch {
      return getFallback();
    }

    try {
      return formatter(options);
    } catch (error) {
      onError(
        new IntlError(IntlErrorCode.FORMATTING_ERROR, (error as Error).message)
      );
      return getFallback();
    }
  }

  function dateTime(
    /** If a number is supplied, this is interpreted as a UTC timestamp. */
    value: Date | number,
    options?: DateTimeFormatOptions
  ): string;
  function dateTime(
    /** If a number is supplied, this is interpreted as a UTC timestamp. */
    value: Date | number,
    format?: FormatNames['dateTime'],
    options?: DateTimeFormatOptions
  ): string;
  function dateTime(
    value: Date | number,
    formatOrOptions?: FormatNames['dateTime'] | DateTimeFormatOptions,
    overrides?: DateTimeFormatOptions
  ) {
    return getFormattedValue(
      formatOrOptions,
      overrides,
      formats?.dateTime,
      (options) => {
        options = applyTimeZone(options);
        return formatters.getDateTimeFormat(locale, options).format(value);
      },
      () => String(value)
    );
  }

  function dateTimeRange(
    /** If a number is supplied, this is interpreted as a UTC timestamp. */
    start: Date | number,
    /** If a number is supplied, this is interpreted as a UTC timestamp. */
    end: Date | number,
    options?: DateTimeFormatOptions
  ): string;
  function dateTimeRange(
    /** If a number is supplied, this is interpreted as a UTC timestamp. */
    start: Date | number,
    /** If a number is supplied, this is interpreted as a UTC timestamp. */
    end: Date | number,
    format?: FormatNames['dateTime'],
    options?: DateTimeFormatOptions
  ): string;
  function dateTimeRange(
    start: Date | number,
    end: Date | number,
    formatOrOptions?: FormatNames['dateTime'] | DateTimeFormatOptions,
    overrides?: DateTimeFormatOptions
  ) {
    return getFormattedValue(
      formatOrOptions,
      overrides,
      formats?.dateTime,
      (options) => {
        options = applyTimeZone(options);
        return formatters
          .getDateTimeFormat(locale, options)
          .formatRange(start, end);
      },
      () => [dateTime(start), dateTime(end)].join(' – ')
    );
  }

  function number(
    value: number | bigint,
    options?: NumberFormatOptions
  ): string;
  function number(
    value: number | bigint,
    format?: FormatNames['number'],
    options?: NumberFormatOptions
  ): string;
  function number(
    value: number | bigint,
    formatOrOptions?: FormatNames['number'] | NumberFormatOptions,
    overrides?: NumberFormatOptions
  ) {
    return getFormattedValue(
      formatOrOptions,
      overrides,
      formats?.number,
      (options) => formatters.getNumberFormat(locale, options).format(value),
      () => String(value)
    );
  }

  function getGlobalNow() {
    // Only read when necessary to avoid triggering a `dynamicIO` error
    // unnecessarily (`now` is only needed for `format.relativeTime`)
    if (props.now) {
      return props.now;
    } else {
      onError(
        new IntlError(
          IntlErrorCode.ENVIRONMENT_FALLBACK,
          process.env.NODE_ENV !== 'production'
            ? `The \`now\` parameter wasn't provided to \`relativeTime\` and there is no global default configured, therefore the current time will be used as a fallback. See https://next-intl.dev/docs/usage/dates-times#relative-times-usenow`
            : undefined
        )
      );
      return new Date();
    }
  }

  function relativeTime(
    /** The date time that needs to be formatted. */
    date: number | Date,
    /** The reference point in time to which `date` will be formatted in relation to. If this value is absent, a globally configured `now` value or alternatively the current time will be used. */
    now?: RelativeTimeFormatOptions['now']
  ): string;
  function relativeTime(
    /** The date time that needs to be formatted. */
    date: number | Date,
    options?: RelativeTimeFormatOptions
  ): string;
  function relativeTime(
    date: number | Date,
    nowOrOptions?: RelativeTimeFormatOptions['now'] | RelativeTimeFormatOptions
  ) {
    try {
      let nowDate: Date | undefined,
        unit: Intl.RelativeTimeFormatUnit | undefined;
      const opts: Intl.RelativeTimeFormatOptions = {};
      if (nowOrOptions instanceof Date || typeof nowOrOptions === 'number') {
        nowDate = new Date(nowOrOptions);
      } else if (nowOrOptions) {
        if (nowOrOptions.now != null) {
          nowDate = new Date(nowOrOptions.now);
        } else {
          nowDate = getGlobalNow();
        }
        unit = nowOrOptions.unit;
        opts.style = nowOrOptions.style;
        // @ts-expect-error -- Types are slightly outdated
        opts.numberingSystem = nowOrOptions.numberingSystem;
      }

      if (!nowDate) {
        nowDate = getGlobalNow();
      }

      const dateDate = new Date(date);
      const seconds = (dateDate.getTime() - nowDate.getTime()) / 1000;

      if (!unit) {
        unit = resolveRelativeTimeUnit(seconds);
      }

      // `numeric: 'auto'` can theoretically produce output like "yesterday",
      // but it only works with integers. E.g. -1 day will produce "yesterday",
      // but -1.1 days will produce "-1.1 days". Rounding before formatting is
      // not desired, as the given dates might cross a threshold were the
      // output isn't correct anymore. Example: 2024-01-08T23:00:00.000Z and
      // 2024-01-08T01:00:00.000Z would produce "yesterday", which is not the
      // case. By using `always` we can ensure correct output. The only exception
      // is the formatting of times <1 second as "now".
      opts.numeric = unit === 'second' ? 'auto' : 'always';

      const value = calculateRelativeTimeValue(seconds, unit);
      return formatters.getRelativeTimeFormat(locale, opts).format(value, unit);
    } catch (error) {
      onError(
        new IntlError(IntlErrorCode.FORMATTING_ERROR, (error as Error).message)
      );
      return String(date);
    }
  }

  type FormattableListValue = string | ReactElement;
  function list<Value extends FormattableListValue>(
    value: Iterable<Value>,
    options?: Intl.ListFormatOptions
  ): Value extends string ? string : Iterable<ReactElement>;
  function list<Value extends FormattableListValue>(
    value: Iterable<Value>,
    format?: FormatNames['list'],
    options?: Intl.ListFormatOptions
  ): Value extends string ? string : Iterable<ReactElement>;
  function list<Value extends FormattableListValue>(
    value: Iterable<Value>,
    formatOrOptions?: FormatNames['list'] | Intl.ListFormatOptions,
    overrides?: Intl.ListFormatOptions
  ): Value extends string ? string : Iterable<ReactElement> {
    const serializedValue: Array<string> = [];
    const richValues = new Map<string, Value>();

    // `formatToParts` only accepts strings, therefore we have to temporarily
    // replace React elements with a placeholder ID that can be used to retrieve
    // the original value afterwards.
    let index = 0;
    for (const item of value) {
      let serializedItem;
      if (typeof item === 'object') {
        serializedItem = String(index);
        richValues.set(serializedItem, item);
      } else {
        serializedItem = String(item);
      }
      serializedValue.push(serializedItem);
      index++;
    }

    return getFormattedValue<
      Intl.ListFormatOptions,
      Value extends string ? string : Iterable<ReactElement>
    >(
      formatOrOptions,
      overrides,
      formats?.list,
      // @ts-expect-error -- `richValues.size` is used to determine the return type, but TypeScript can't infer the meaning of this correctly
      (options) => {
        const result = formatters
          .getListFormat(locale, options)
          .formatToParts(serializedValue)
          .map((part) =>
            part.type === 'literal'
              ? part.value
              : richValues.get(part.value) || part.value
          );

        if (richValues.size > 0) {
          return result;
        } else {
          return result.join('');
        }
      },
      () => String(value)
    );
  }

  return {dateTime, number, relativeTime, list, dateTimeRange};
}
