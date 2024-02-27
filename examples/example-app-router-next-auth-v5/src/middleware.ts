import { auth as authMiddleware } from "@/auth";
import createIntlMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
});

export default authMiddleware((req) => intlMiddleware(req));

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
