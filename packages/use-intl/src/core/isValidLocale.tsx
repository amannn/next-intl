import type {Locale} from './AppConfig.tsx';

/**
 * Validates a locale against a list of valid locales.
 *
 * Additionally, the provided locales are validated to
 * ensure they follow the IETF language tag standard.
 *
 * @see https://en.wikipedia.org/wiki/IETF_language_tag#Extension_U_(Unicode_Locale)
 */
export default function isValidLocale<LocaleType extends Locale>(
  locales: ReadonlyArray<LocaleType>,
  candidate?: string
): candidate is LocaleType {
  if (process.env.NODE_ENV !== 'production') {
    for (const locale of locales) {
      try {
        const constructed = new Intl.Locale(locale);
        if (!constructed.language) {
          throw new Error('Language is required');
        }
      } catch (cause) {
        throw new Error(
          `Found invalid locale within provided \`locales\`: "${locale}"\nPlease ensure you're using valid IETF language tags (e.g. "en-US").`,
          {cause}
        );
      }
    }
  }

  return locales.includes(candidate as LocaleType);
}
