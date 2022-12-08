import 'server-only';
import NextIntlRequestStorage from '../server/NextIntlRequestStorage';

export default function useTranslations(namespace?: string) {
  const translator = NextIntlRequestStorage.getTranslator();

  return function translate(key: string, ...rest: any) {
    const path = [namespace, key].filter((part) => part != null).join('.');

    // @ts-expect-error We're using the types from the real `useTranslations` anyway
    return translator(path, ...rest);
  };
}
