import IntlConfig from 'use-intl/dist/core/IntlConfig';

export type GetRequestConfigParams = {
  locale: string;
};

/**
 * Should be called in `i18n.ts` to create the configuration for the current request.
 */
export default function getRequestConfig(
  createRequestConfig: ({
    locale
  }: GetRequestConfigParams) => IntlConfig | Promise<IntlConfig>
) {
  return createRequestConfig;
}
