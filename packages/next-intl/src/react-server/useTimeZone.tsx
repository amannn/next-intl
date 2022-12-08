import NextIntlRequestStorage from '../server/NextIntlRequestStorage';

export default function useTimeZone() {
  return NextIntlRequestStorage.getTimeZone();
}
