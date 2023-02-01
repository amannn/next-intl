import NextIntlConfig from './NextIntlConfig';

export type GetRequestConfigParams = {
  locale: string;
};

export default function getRequestConfig(
  createRequestConfig: ({
    locale
  }: GetRequestConfigParams) => NextIntlConfig | Promise<NextIntlConfig>
) {
  return createRequestConfig;
}
