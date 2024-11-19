import type {Locale} from './AppConfig.tsx';

/**
 * Checks if a locale exists in a list of locales.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale
 */
export default function hasLocale<LocaleType extends Locale>(
  locales: ReadonlyArray<LocaleType>,
  candidate?: string | null
): candidate is LocaleType {
  return locales.includes(candidate as LocaleType);
}
