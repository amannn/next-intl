import type {IntlConfig} from 'use-intl/core';

export type RequestConfig = Omit<IntlConfig, 'locale'> & {
  /**
   * Instead of reading a `requestLocale` from the argument that's passed to the
   * function within `getRequestConfig`, you can include a locale as part of the
   * returned request configuration.
   *
   * This can be helpful for the following use cases:
   * - Apps that only support a single language
   * - Apps where the locale should be read from user settings instead of the pathname
   * - Providing a fallback locale in case the locale was not matched by the middleware
   **/
  locale?: IntlConfig['locale'];
};

export type GetRequestConfigParams = {
  /**
   * The locale that was matched by the `[locale]` path segment.
   *
   * Note however that this can be overridden in async APIs when the `locale`
   * is explicitly passed (e.g. `getTranslations({locale: 'en'})`).
   */
  locale: string;

  /**
   * The locale that was matched by the `[locale]` path segment.
   *
   * Note however that this can be overridden in async APIs when the `locale`
   * is explicitly passed (e.g. `getTranslations({locale: 'en'})`).
   *
   * This value will be `undefined` in case the middleware didn't run (e.g. in
   * case of a non-matching path segment).
   */
  requestLocale: Promise<string | undefined>;
};

/**
 * Should be called in `i18n/request.ts` to create the configuration for the current request.
 */
export default function getRequestConfig(
  createRequestConfig: (
    params: GetRequestConfigParams
  ) => RequestConfig | Promise<RequestConfig>
) {
  return createRequestConfig;
}
