import {NextRequest, NextResponse} from 'next/server';
import resolveLocale from 'next-intl/resolveLocale';
import i18n from './i18n';

export function middleware(request: NextRequest) {
  const locale = resolveLocale(request.headers, i18n);
  return NextResponse.redirect(new URL('/' + locale, request.url));
}

export const config = {
  matcher: '/'
};
