import type {Locale} from 'use-intl';
import type {InitializedLocaleCookieConfig} from '../../routing/config.js';
import {getBasePath} from './utils.js';

/**
 * We have to keep the cookie value in sync as Next.js might
 * skip a request to the server due to its router cache.
 * See https://github.com/amannn/next-intl/issues/786.
 */
export default function syncLocaleCookie(
  localeCookie: InitializedLocaleCookieConfig,
  locale: Locale,
  nextLocale?: Locale
) {
  const isSwitchingLocale = nextLocale !== locale && nextLocale != null;

  if (!localeCookie || !isSwitchingLocale) {
    return;
  }

  const {name, ...rest} = localeCookie;

  if (!rest.path) {
    rest.path = getBasePath() || '/';
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
