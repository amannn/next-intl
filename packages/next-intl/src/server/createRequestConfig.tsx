// @ts-expect-error
// eslint-disable-next-line import/no-extraneous-dependencies
import getRuntimeConfig from 'next-intl/config';
import IntlConfiguration from 'use-intl/dist/core/IntlConfiguration';
import {GetRequestConfigParams} from './getRequestConfig';

export default getRuntimeConfig as (
  params: GetRequestConfigParams
) => IntlConfiguration | Promise<IntlConfiguration>;
