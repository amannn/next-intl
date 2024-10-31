import 'next-intl';
import {routing} from '@/i18n/routing';
import en from './messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof en;
  }
}

