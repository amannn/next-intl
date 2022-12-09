import {useContext} from 'react';
import IntlContext from './IntlContext';

export default function useIntlContext() {
  const context = useContext(IntlContext);

  if (!context) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? 'No intl context found. Have you configured the provider?'
        : undefined
    );
  }

  return context;
}
