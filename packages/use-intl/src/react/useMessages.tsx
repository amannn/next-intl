import useIntlContext from './useIntlContext';

export default function useMessages() {
  return useIntlContext().messages;
}
