import createMiddleware from 'next-intl/middleware';
import {locales} from './config';
import {NextRequest, NextResponse} from 'next/server';

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAppRoute = pathname === '/app' || pathname.startsWith('/app/');

  // Could be read from the user profile too if we want
  // to change the default for the user on public pages
  // that is being redirect to at `/`.
  const defaultLocale = 'en';

  const intlMiddleware = createMiddleware({
    locales,
    defaultLocale
  });

  if (isAppRoute) {
    // Add a hint that we can read in `i18n.ts`
    request.headers.set('x-app-route', 'true');
    return NextResponse.next({headers: request.headers});
  } else {
    return intlMiddleware(request);
  }
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de|en)/:path*', '/app/:path*']
};
