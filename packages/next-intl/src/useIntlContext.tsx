import {useContext} from 'react';
import NextIntlContext from './NextIntlContext';

export default function useIntlContext() {
  const context = useContext(NextIntlContext);

  if (!context) {
    if (__DEV__) {
      throw new Error(
        'No next-intl context found, please use `NextIntlProvider`.'
      );
    } else {
      throw new Error();
    }
  }

  return context;
}
