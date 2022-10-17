import Formats from './Formats';
import IntlError from './IntlError';

/**
 * Should be used for entry points that configure the library.
 */

type IntlConfiguration = {
  /** A valid Unicode locale tag (e.g. "en" or "en-GB"). */
  locale: string;
  /** Global formats can be provided to achieve consistent
   * formatting across components. */
  formats?: Partial<Formats>;
  /** A time zone as defined in [the tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) which will be applied when formatting dates and times. If this is absent, the user time zone will be used. You can override this by supplying an explicit time zone to `formatDateTime`. */
  timeZone?: string;
  /** This callback will be invoked when an error is encountered during
   * resolving a message or formatting it. This defaults to `console.error` to
   * keep your app running. You can customize the handling by taking
   * `error.code` into account. */
  onError?(error: IntlError): void;
  /** Will be called when a message couldn't be resolved or formatting it led to
   * an error. This defaults to `${namespace}.${key}` You can use this to
   * customize what will be rendered in this case. */
  getMessageFallback?(info: {
    error: IntlError;
    key: string;
    namespace?: string;
  }): string;
  /**
   * Providing this value will have two effects:
   * 1. It will be used as the default for the `now` argument of
   *    `useIntl().formatRelativeTime` if no explicit value is provided.
   * 2. It will be returned as a static value from the `useNow` hook. Note
   *    however that when `updateInterval` is configured on the `useNow` hook,
   *    the global `now` value will only be used for the initial render, but
   *    afterwards the current date will be returned continuously.
   */
  now?: Date;
};

/**
 * A stricter set of the configuration that should be used internally
 * once defaults are assigned to `IntlConfiguration`.
 */
export type InitializedIntlConfiguration = IntlConfiguration & {
  onError: NonNullable<IntlConfiguration['onError']>;
  getMessageFallback: NonNullable<IntlConfiguration['getMessageFallback']>;
};

export default IntlConfiguration;
