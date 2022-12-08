import 'server-only';
import NextIntlRequestStorage from './NextIntlRequestStorage';

export default function useLocale() {
  return NextIntlRequestStorage.getLocale();
}
