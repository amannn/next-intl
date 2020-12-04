import {useContext} from 'react';
import IntlContext from './IntlContext';

export default function useIntlContext() {
  const context = useContext(IntlContext);

  if (!context) {
    if (__DEV__) {
      throw new Error('No context found. Have you configured the provider?');
    } else {
      throw new Error();
    }
  }

  return context;
}
