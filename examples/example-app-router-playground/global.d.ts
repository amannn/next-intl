import 'next-intl';
import {formats} from '@/i18n/request';
import {routing} from '@/i18n/routing';
import en from './messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
  }
}

type Messages = typeof en;
type Formats = typeof formats;

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}

  // Use type safe formats with `next-intl`
  interface IntlFormats extends Formats {}
}
