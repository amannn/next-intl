import AbstractIntlMessages from 'use-intl/dist/core/AbstractIntlMessages';
import IntlProviderProps from 'use-intl/dist/react/IntlProviderProps';

export type NextIntlRuntimeConfigParams = {
  locale: string;
};

export type NextIntlStaticConfig = {
  locales: Array<string>;
  defaultLocale: string;
};

export type NextIntlRuntimeConfig = {
  messages?: AbstractIntlMessages;
} & Pick<
  IntlProviderProps,
  | 'defaultTranslationValues'
  | 'formats'
  | 'onError'
  | 'getMessageFallback'
  | 'now'
  | 'timeZone'
>;

export type GetNextIntlRuntimeConfig = (
  params: NextIntlRuntimeConfigParams
) => Promise<NextIntlRuntimeConfig> | NextIntlRuntimeConfig;

/** @deprecated See the updated docs for the config file */
type NextIntlConfig = NextIntlStaticConfig &
  NextIntlRuntimeConfig & {
    /** @deprecated Use the `messages` property instead */
    getMessages?(
      params: NextIntlRuntimeConfigParams
    ): AbstractIntlMessages | Promise<AbstractIntlMessages>;
  };
export default NextIntlConfig;
