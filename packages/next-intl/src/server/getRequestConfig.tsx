import IntlConfig from 'use-intl/dist/core/IntlConfig';

type RequestConfig = Omit<IntlConfig, 'locale'>;

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
