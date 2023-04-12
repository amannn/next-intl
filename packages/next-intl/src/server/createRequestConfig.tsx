// @ts-expect-error
// eslint-disable-next-line import/no-extraneous-dependencies
import getRuntimeConfig from 'next-intl/config';
import IntlConfig from 'use-intl/dist/core/IntlConfig';
import {GetRequestConfigParams} from './getRequestConfig';

export default getRuntimeConfig as (
  params: GetRequestConfigParams
) => IntlConfig | Promise<IntlConfig>;
