import NextIntlRequestStorage from '../server/NextIntlRequestStorage';

export default function useIntl() {
  return NextIntlRequestStorage.getIntl();
}
