// Reuse the legacy cookie name
// https://nextjs.org/docs/advanced-features/i18n-routing#leveraging-the-next_locale-cookie
export const COOKIE_LOCALE_NAME = 'NEXT_LOCALE';
export const COOKIE_MAX_AGE = 31536000; // 1 year
export const COOKIE_SAME_SITE = 'strict';

export const COOKIE_BASE_PATH_NAME = 'NEXT_INTL_BASE_PATH';

// Should take precedence over the cookie
export const HEADER_LOCALE_NAME = 'X-NEXT-INTL-LOCALE';

// In a URL like "/en-US/about", the locale segment is "en-US"
export const LOCALE_SEGMENT_NAME = 'locale';
