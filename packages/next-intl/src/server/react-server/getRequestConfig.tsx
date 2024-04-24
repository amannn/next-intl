import type {IntlConfig} from 'use-intl/core';

type RequestConfig = Omit<IntlConfig, 'locale'> & {
  /**
   * Instead of reading a `locale` from the argument that's passed to the
   * function within `getRequestConfig`, you can include a locale as part of the
   * returned request configuration.
   *
   * This is helpful for apps that only support a single language and for apps
   * where the locale should be read from user settings instead of the pathname.
   **/
  locale?: IntlConfig['locale'];
};

export type GetRequestConfigParams = {
  locale: string;
};

/**
 * Should be called in `i18n.ts` to create the configuration for the current request.
 */
export default function getRequestConfig(
  createRequestConfig: (
    params: GetRequestConfigParams
  ) => RequestConfig | Promise<RequestConfig>
) {
  return createRequestConfig;
}
