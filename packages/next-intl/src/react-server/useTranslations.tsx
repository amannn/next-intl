import 'server-only';
import NextIntlRequestStorage from '../server/NextIntlRequestStorage';

export default function useTranslations(namespace: string) {
  const translator = NextIntlRequestStorage.getTranslator();
  return function translate(key: string, ...rest: any) {
    key = [namespace, key].filter(Boolean).join('.');
    return translator(key, ...rest);
  };
}
