import IntlConfiguration from 'use-intl/dist/core/IntlConfiguration';

export type GetRequestConfigParams = {
  locale: string;
};

/**
 * Should be called in `i18n.ts` to create the configuration for the current request.
 */
export default function getRequestConfig(
  createRequestConfig: ({
    locale
  }: GetRequestConfigParams) => IntlConfiguration | Promise<IntlConfiguration>
) {
  return createRequestConfig;
}
