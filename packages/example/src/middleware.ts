import acceptLanguageParser from 'accept-language-parser';
import {headers} from 'next/headers';
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import i18n from './i18n';

// Somehow not invoked?

function resolveLocale(requestHeaders: Headers) {
  const locale =
    acceptLanguageParser.pick(
      i18n.locales,
      requestHeaders.get('accept-language') || i18n.defaultLocale
    ) || i18n.defaultLocale;

  return locale;
}

export function middleware(request: NextRequest) {
  const locale = resolveLocale(headers());
  return NextResponse.redirect(new URL('/' + locale, request.url));
}

export const config = {
  matcher: '/test'
};
