export default function validateLocale(locale: string) {
  try {
    const constructed = new Intl.Locale(locale);
    if (!constructed.language) {
      throw new Error('Language is required');
    }
  } catch {
    console.error(
      `An invalid locale was provided: "${locale}"\nPlease ensure you're using a valid Unicode locale identifier (e.g. "en-US").`
    );
  }
}
