import {COOKIE_LOCALE_NAME} from '../shared/constants';

function getCookieValueByName(name: string) {
  // https://stackoverflow.com/a/15724300/343045
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop()?.split(';').shift();
    if (part) return part;
  }

  throw new Error(
    `Unable to find next-intl cookie, have you configured the middleware?`
  );
}

export default function getCookieLocale() {
  return getCookieValueByName(COOKIE_LOCALE_NAME);
}
