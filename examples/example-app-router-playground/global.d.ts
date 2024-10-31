import 'next-intl';
import {formats} from '@/i18n/request';
import {routing} from '@/i18n/routing';
import en from './messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Formats: typeof formats;
    Messages: typeof en;
  }
}
