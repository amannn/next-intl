import NextIntlRequestStorage from '../server/NextIntlRequestStorage';

export default function useNow() {
  return NextIntlRequestStorage.getNow();
}
