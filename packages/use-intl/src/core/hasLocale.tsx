import type {Locale} from './AppConfig.tsx';

/**
 * Checks if a locale exists in a list of locales.
 *
 * Additionally, in development, the provided locales are validated to
 * ensure they follow the Unicode language identifier standard.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale
 */
export default function hasLocale<LocaleType extends Locale>(
  locales: ReadonlyArray<LocaleType>,
  candidate?: string | null
): candidate is LocaleType {
  if (process.env.NODE_ENV !== 'production') {
    for (const locale of locales) {
      try {
        const constructed = new Intl.Locale(locale);
        if (!constructed.language) {
          throw new Error('Language is required');
        }
      } catch {
        console.error(
          `Found invalid locale within provided \`locales\`: "${locale}"\nPlease ensure you're using a valid Unicode locale identifier (e.g. "en-US").`
        );
      }
    }
  }

  return locales.includes(candidate as LocaleType);
}
