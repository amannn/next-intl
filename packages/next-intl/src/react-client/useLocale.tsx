import {useParams} from 'next/navigation';
import {useLocale as useBaseLocale} from 'use-intl/react';
import {LOCALE_SEGMENT_NAME} from '../shared/constants.tsx';

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
      locale = params[LOCALE_SEGMENT_NAME];
    } else {
      throw error;
    }
  }

  return locale;
}
