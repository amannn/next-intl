import {type Formats} from '../core';
import useIntlContext from './useIntlContext';

export default function useFormats(): Partial<Formats> {
  const context = useIntlContext();

  if (!context.formats) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? 'No formats found. Have you configured them correctly? See https://next-intl-docs.vercel.app/docs/configuration#formats'
        : undefined
    );
  }

  return context.formats;
}
