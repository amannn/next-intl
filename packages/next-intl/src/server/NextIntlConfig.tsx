import AbstractIntlMessages from 'use-intl/dist/core/AbstractIntlMessages';
import IntlProviderProps from 'use-intl/dist/react/IntlProviderProps';

export type NextIntlRuntimeConfig = Pick<
  IntlProviderProps,
  'locale' | 'now' | 'timeZone'
>;

type NextIntlConfig = {
  locales: Array<string>;
  defaultLocale: string;

  getMessages?(
    runtimeConfig: NextIntlRuntimeConfig
  ): AbstractIntlMessages | Promise<AbstractIntlMessages>;
} & Pick<
  IntlProviderProps,
  | 'defaultTranslationValues'
  | 'formats'
  | 'onError'
  | 'getMessageFallback'
  | 'now'
  | 'timeZone'
>;

export default NextIntlConfig;
