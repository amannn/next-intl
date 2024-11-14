import {hasLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import messages from '../../messages/en.json';
import {rootParams} from './future';
import {routing} from './routing';

export default getRequestConfig(async () => {
  const params = await rootParams();
  const locale = hasLocale(routing.locales, params.locale)
    ? params.locale
    : routing.defaultLocale;

  return {
    locale,
    messages
  };
});
