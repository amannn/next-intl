export const locales = ['en', 'de'] as const;

export const defaultLocale: Locale = 'en';

export type Locale = (typeof locales)[number];
