import {NextRequest, NextResponse} from 'next/server';
import {LocaleCookieConfig} from '../routing/config';

export default function syncCookie(
  request: NextRequest,
  response: NextResponse,
  locale: string,
  localeCookie: LocaleCookieConfig
) {
  const {name, ...rest} = localeCookie;
  const hasOutdatedCookie = request.cookies.get(name!)?.value !== locale;

  if (hasOutdatedCookie) {
    response.cookies.set(name!, locale, {
      path: request.nextUrl.basePath || undefined,
      ...rest
    });
  }
}
