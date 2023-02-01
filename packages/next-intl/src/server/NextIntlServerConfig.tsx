// eslint-disable-next-line import/no-extraneous-dependencies
import NextIntlServerConfig, {
  getRuntimeConfig as suppliedGetRuntimeConfig
  // @ts-expect-error
} from 'next-intl/config';
import NextIntlConfig, {
  NextIntlRuntimeConfig,
  NextIntlRuntimeConfigParams,
  NextIntlStaticConfig
} from './NextIntlConfig';

export default NextIntlServerConfig as NextIntlStaticConfig | NextIntlConfig;

export const getRuntimeConfig = suppliedGetRuntimeConfig as
  | ((
      params: NextIntlRuntimeConfigParams
    ) => NextIntlRuntimeConfig | Promise<NextIntlRuntimeConfig>)
  | undefined;
