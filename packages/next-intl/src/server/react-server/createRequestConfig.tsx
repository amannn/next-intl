// eslint-disable-next-line import/no-extraneous-dependencies
import getRuntimeConfig from 'next-intl/config';
import type {GetRequestConfigParams, RequestConfig} from './getRequestConfig';

export default getRuntimeConfig as unknown as (
  params: GetRequestConfigParams
) => RequestConfig | Promise<RequestConfig>;
