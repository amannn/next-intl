import 'use-intl';
import messages from './messages/en.json';
import {locales} from './src/config';

declare module 'use-intl' {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: typeof messages;
  }
}
