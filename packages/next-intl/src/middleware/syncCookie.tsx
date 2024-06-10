import {NextRequest, NextResponse} from 'next/server';
import {
  COOKIE_LOCALE_NAME,
  COOKIE_MAX_AGE,
  COOKIE_SAME_SITE
} from '../shared/constants';

export default function syncCookie(
  request: NextRequest,
  response: NextResponse,
  locale: string
) {
  const hasOutdatedCookie =
    request.cookies.get(COOKIE_LOCALE_NAME)?.value !== locale;
  if (hasOutdatedCookie) {
    response.cookies.set(COOKIE_LOCALE_NAME, locale, {
      path: request.nextUrl.basePath || undefined,
      sameSite: COOKIE_SAME_SITE,
      maxAge: COOKIE_MAX_AGE
    });
  }
}
