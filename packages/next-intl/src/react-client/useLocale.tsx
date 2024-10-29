import {useLocale as useBaseLocale} from 'use-intl/react';
import {LOCALE_SEGMENT_NAME} from '../shared/constants.tsx';
import useParams from '../shared/useParams.tsx';

export default function useLocale(): string {
  const params = useParams();

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
