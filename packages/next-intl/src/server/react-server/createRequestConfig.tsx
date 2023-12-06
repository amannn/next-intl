// eslint-disable-next-line import/no-extraneous-dependencies
import getRuntimeConfig from 'next-intl/config';
import type {IntlConfig} from 'use-intl/core';
import type {GetRequestConfigParams} from './getRequestConfig';

export default getRuntimeConfig as unknown as (
  params: GetRequestConfigParams
) => IntlConfig | Promise<IntlConfig>;
