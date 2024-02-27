import { auth } from "@/auth";
import { PropsWithLocale, getMessages, timeZone } from "@/i18n";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { LocaleSwitch } from "./components/locale-switch";
import { MainNavigation } from "./components/main-navigation";
import { FC, PropsWithChildren } from "react";

type LocaleLayoutProps = PropsWithChildren<PropsWithLocale>;

const LocaleLayout: FC<LocaleLayoutProps> = async ({
  children,
  params: { locale },
}) => {
  const session = await auth();
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SessionProvider session={session}>
            <main>
              <MainNavigation />
              <LocaleSwitch />
              {children}
            </main>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
