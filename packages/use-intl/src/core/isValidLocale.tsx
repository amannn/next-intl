import type {Locale} from './AppConfig.tsx';

export default function isValidLocale<LocaleType extends Locale>(
  locales: ReadonlyArray<LocaleType>,
  candidate?: string
): candidate is LocaleType {
  return locales.includes(candidate as LocaleType);
}
