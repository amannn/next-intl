import NextIntlRequestStorage from '../server/NextIntlRequestStorage';

export default function useLocale() {
  return NextIntlRequestStorage.getLocale();
}
