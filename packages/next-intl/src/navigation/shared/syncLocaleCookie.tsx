import type {Locale} from 'use-intl';
import {InitializedLocaleCookieConfig} from '../../routing/config.tsx';
import {getBasePath} from './utils.tsx';

/**
 * We have to keep the cookie value in sync as Next.js might
 * skip a request to the server due to its router cache.
 * See https://github.com/amannn/next-intl/issues/786.
 */
export default function syncLocaleCookie(
  localeCookie: InitializedLocaleCookieConfig,
  pathname: string | null,
  locale: Locale,
  nextLocale?: Locale
) {
  const isSwitchingLocale = nextLocale !== locale && nextLocale != null;

  if (
    !localeCookie ||
    !isSwitchingLocale ||
    // Theoretical case, we always have a pathname in a real app,
    // only not when running e.g. in a simulated test environment
    !pathname
  ) {
    return;
  }

  const basePath = getBasePath(pathname);
  const hasBasePath = basePath !== '';
  const defaultPath = hasBasePath ? basePath : '/';

  const {name, ...rest} = localeCookie;

  if (!rest.path) {
    rest.path = defaultPath;
  }

  let localeCookieString = `${name}=${nextLocale};`;
  for (const [key, value] of Object.entries(rest)) {
    // Map object properties to cookie properties.
    // Interestingly, `maxAge` corresponds to `max-age`,
    // while `sameSite` corresponds to `SameSite`.
    // Also, keys are case-insensitive.
    const targetKey = key === 'maxAge' ? 'max-age' : key;

    localeCookieString += `${targetKey}`;

    if (typeof value !== 'boolean') {
      localeCookieString += '=' + value;
    }

    // A trailing ";" is allowed by browsers
    localeCookieString += ';';
  }

  // Note that writing to `document.cookie` doesn't overwrite all
  // cookies, but only the ones referenced via the name here.
  document.cookie = localeCookieString;
}
