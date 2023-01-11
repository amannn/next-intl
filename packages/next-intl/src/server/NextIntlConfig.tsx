import AbstractIntlMessages from 'use-intl/dist/core/AbstractIntlMessages';
import IntlProviderProps from 'use-intl/dist/react/IntlProviderProps';

// TODO: Move out of server?

export type NextIntlRuntimeConfig = Pick<
  IntlProviderProps,
  'locale' | 'now' | 'timeZone'
>;

type NextIntlConfig = {
  locales: Array<string>;
  defaultLocale: string;
  cookieName?: string;
  // TODO: `domains`

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
