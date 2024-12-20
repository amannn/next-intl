import {useParams} from 'next/navigation';
// Workaround for some bundle splitting until we have ESM
import {useLocale as useBaseLocale} from 'use-intl/_useLocale';
import {LOCALE_SEGMENT_NAME} from '../shared/constants';

let hasWarnedForParams = false;

export default function useLocale(): string {
  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  const params = useParams() as ReturnType<typeof useParams> | null;

  let locale;

  try {
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/rules-of-hooks, react-compiler/react-compiler -- False positive
    locale = useBaseLocale();
  } catch (error) {
    if (typeof params?.[LOCALE_SEGMENT_NAME] === 'string') {
      if (process.env.NODE_ENV !== 'production' && !hasWarnedForParams) {
        console.warn(
          'Deprecation warning: `useLocale` has returned a default from `useParams().locale` since no `NextIntlClientProvider` ancestor was found for the calling component. This behavior will be removed in the next major version. Please ensure all Client Components that use `next-intl` are wrapped in a `NextIntlClientProvider`.'
        );
        hasWarnedForParams = true;
      }
      locale = params[LOCALE_SEGMENT_NAME];
    } else {
      throw error;
    }
  }

  return locale;
}
