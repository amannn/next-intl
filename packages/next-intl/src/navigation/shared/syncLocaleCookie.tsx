import {
  COOKIE_LOCALE_NAME,
  COOKIE_MAX_AGE,
  COOKIE_SAME_SITE
} from '../../shared/constants';

/**
 * We have to keep the cookie value in sync as Next.js might
 * skip a request to the server due to its router cache.
 * See https://github.com/amannn/next-intl/issues/786.
 */
export default function syncLocaleCookie(
  pathname: string | null,
  locale: string,
  nextLocale?: string
) {
  const isSwitchingLocale = nextLocale !== locale;

  if (
    !isSwitchingLocale ||
    // Theoretical case, we always have a pathname in a real app,
    // only not when running e.g. in a simulated test environment
    !pathname
  ) {
    return;
  }

  const basePath = window.location.pathname.replace(pathname, '');
  const hasBasePath = basePath !== '';
  const path = hasBasePath ? basePath : '/';

  // Note that writing to `document.cookie` doesn't overwrite all
  // cookies, but only the ones referenced via the name here.
  document.cookie = `${COOKIE_LOCALE_NAME}=${nextLocale}; path=${path}; max-age=${COOKIE_MAX_AGE}; sameSite=${COOKIE_SAME_SITE}`;
}
