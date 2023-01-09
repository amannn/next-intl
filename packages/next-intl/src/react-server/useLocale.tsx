import {headers} from 'next/headers';
import {HEADER_LOCALE_NAME} from '../shared/constants';

export default function useLocale() {
  const locale = headers().get(HEADER_LOCALE_NAME);

  if (!locale) {
    throw new Error(
      'Unable to find `locale`, have you configured the middleware?`'
    );
  }

  return locale;
}
