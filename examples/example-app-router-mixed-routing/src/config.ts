export const locales = ['en', 'de'] as const;

export type Locale = (typeof locales)[number];
