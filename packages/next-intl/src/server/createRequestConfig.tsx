// @ts-expect-error
// eslint-disable-next-line import/no-extraneous-dependencies
import getRuntimeConfig from 'next-intl/config';
import NextIntlConfig from './NextIntlConfig';
import {GetRequestConfigParams} from './getRequestConfig';

export default getRuntimeConfig as (
  params: GetRequestConfigParams
) => NextIntlConfig | Promise<NextIntlConfig>;
