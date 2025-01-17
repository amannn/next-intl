import type {Locales} from './types.js';

export default function validateLocales(locales: Locales) {
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
