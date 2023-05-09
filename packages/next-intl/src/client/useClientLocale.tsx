import {useParams} from 'next/navigation';
import {useLocale} from 'use-intl';
import {LOCALE_SEGMENT_NAME} from '../shared/constants';

export default function useClientLocale(): string {
  let locale;

  try {
    const params = useParams();

    if (params[LOCALE_SEGMENT_NAME]) {
      locale = params[LOCALE_SEGMENT_NAME];
    }
  } catch (e) {
    // Ignore, might happen in pages directory
  }

  if (!locale) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context conditionally is fine
    locale = useLocale();
  }

  return locale;
}
