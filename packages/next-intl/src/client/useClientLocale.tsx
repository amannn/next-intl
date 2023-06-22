import {useParams} from 'next/navigation';
import {useLocale} from 'use-intl';
import {LOCALE_SEGMENT_NAME} from '../shared/constants';

export default function useClientLocale(): string {
  let locale;

  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  const params = useParams() as ReturnType<typeof useParams> | null;

  if (params?.[LOCALE_SEGMENT_NAME]) {
    locale = params[LOCALE_SEGMENT_NAME];
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context conditionally is fine
    locale = useLocale();
  }

  return locale;
}
