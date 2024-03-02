import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import { locales } from "./i18n";

const createPagesRegex = (pages: string[]) =>
  RegExp(
    `^(/(${locales.join("|")}))?(${pages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
    "i"
  );

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { type: "text" },
        password: { type: "password" },
      },
      authorize(credentials) {
        if (
          credentials?.username === "admin" &&
          credentials?.password === "admin"
        ) {
          return { id: "1", name: "admin" };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    authorized: ({
      auth,
      request: {
        nextUrl: { pathname, origin, basePath, searchParams, href },
      },
    }) => {
      const signInUrl = new URL("/login", origin);
      signInUrl.searchParams.append("callbackUrl", href);

      const isAuthenticated = !!auth;
      const isPublicPage = createPagesRegex(["/", "/login"]).test(pathname);
      const isAuthPage = createPagesRegex(["/login"]).test(pathname);
      const idAuthorized = isAuthenticated || isPublicPage;

      if (!idAuthorized) return NextResponse.redirect(signInUrl);

      if (isAuthenticated && isAuthPage)
        return NextResponse.redirect(
          new URL(searchParams.get("callbackUrl") ?? new URL(origin), origin)
        );

      return idAuthorized;
    },
  },
  pages: {
    signIn: "/login",
  },
});
