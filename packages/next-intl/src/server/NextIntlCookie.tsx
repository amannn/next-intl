// We're using internals here, but if they are not found, worst case they become `any`
import {ReadonlyRequestCookies} from 'next/dist/server/app-render';
import {
  RequestCookies,
  ResponseCookies
} from 'next/dist/server/web/spec-extension/cookies';

// Reuse the legacy cookie name
// https://nextjs.org/docs/advanced-features/i18n-routing#leveraging-the-next_locale-cookie
const COOKIE_NAME = 'NEXT_LOCALE';

type Cookies = ReadonlyRequestCookies | ResponseCookies | RequestCookies;

export default class NextIntlCookie {
  private requestCookies: Cookies;

  constructor(requestCookies: Cookies) {
    this.requestCookies = requestCookies;
  }

  public hasLocale() {
    return 'has' in this.requestCookies && this.requestCookies.has(COOKIE_NAME);
  }

  public getLocale() {
    return this.requestCookies.get(COOKIE_NAME)?.value;
  }

  public setLocale(locale: string) {
    // TODO: Waiting for https://beta.nextjs.org/docs/api-reference/cookies#thread-id=6YOM0
    this.requestCookies.set(COOKIE_NAME, locale);
  }
}
