import en from './messages/en.json';
import {formats} from './src/i18n/request';

type Messages = typeof en;
type Formats = typeof formats;

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}

  // Use type safe formats with `next-intl`
  interface IntlFormats extends Formats {}
}
