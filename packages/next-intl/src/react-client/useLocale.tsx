import {useParams} from 'next/navigation';
// Workaround for some bundle splitting until we have ESM
import useBaseLocale from 'use-intl/_useLocale';
import {LOCALE_SEGMENT_NAME} from '../shared/constants';

export default function useLocale(): string {
  let locale;

  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  const params = useParams() as ReturnType<typeof useParams> | null;

  if (typeof params?.[LOCALE_SEGMENT_NAME] === 'string') {
    locale = params[LOCALE_SEGMENT_NAME];
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context conditionally is fine as long as we're in the render phase
    locale = useBaseLocale();
  }

  return locale;
}
