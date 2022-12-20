import IntlProviderProps from 'use-intl/dist/react/IntlProviderProps';

// TODO: Move out of server?

export type NextIntlRuntimeConfig = Pick<
  IntlProviderProps,
  'locale' | 'now' | 'timeZone'
>;

export type NextIntlStaticOptions = Pick<
  IntlProviderProps,
  | 'defaultTranslationValues'
  | 'messages'
  | 'formats'
  | 'onError'
  | 'getMessageFallback'
>;

type NextI18nConfig = {
  locales: Array<string>;
  defaultLocale: string;
  // TODO: `domains`

  getOptions?(
    runtimeConfig: NextIntlRuntimeConfig
  ): Promise<NextIntlStaticOptions> | NextIntlStaticOptions;
};

export default NextI18nConfig;
