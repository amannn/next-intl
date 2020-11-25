import {useRouter} from 'next/router';
import useIntlContext from './useIntlContext';

export default function useLocale() {
  const context = useIntlContext();
  const nextLocale = useRouter().locale;
  const locale = context.locale || nextLocale;

  if (!locale) {
    if (__DEV__) {
      throw new Error(
        "Couldn't determine locale. Please make sure you use internationalized routing or alternatively pass an explicit locale to `NextIntlProvider`."
      );
    } else {
      throw new Error();
    }
  }

  return locale;
}
