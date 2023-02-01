import AbstractIntlMessages from 'use-intl/dist/core/AbstractIntlMessages';
import IntlProviderProps from 'use-intl/dist/react/IntlProviderProps';

type NextIntlConfig = {
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

export default NextIntlConfig;
