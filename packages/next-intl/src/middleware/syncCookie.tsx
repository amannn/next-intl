import {NextRequest, NextResponse} from 'next/server.js';
import {LocaleCookieConfig} from '../routing/config.tsx';

export default function syncCookie(
  request: NextRequest,
  response: NextResponse,
  locale: string,
  localeCookie: LocaleCookieConfig
) {
  const {name, ...rest} = localeCookie;
  const hasOutdatedCookie = request.cookies.get(name)?.value !== locale;

  if (hasOutdatedCookie) {
    response.cookies.set(name, locale, {
      path: request.nextUrl.basePath || undefined,
      ...rest
    });
  }
}
