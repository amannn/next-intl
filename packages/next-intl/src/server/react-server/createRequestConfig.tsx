import getRuntimeConfig from '../../config.js';
import type {
  GetRequestConfigParams,
  RequestConfig
} from './getRequestConfig.js';

export default getRuntimeConfig as unknown as (
  params: GetRequestConfigParams
) => RequestConfig | Promise<RequestConfig>;
