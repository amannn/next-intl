import messages from "@/messages/fr.json";
import { getRequestConfig } from "next-intl/server";

export const locales = ["fr", "en"] as const;
export const defaultLocale = locales[0];
export const timeZone = "Europe/Paris";

export type PropsWithLocale<T = unknown> = T & { params: { locale: string } };
export type Messages = typeof messages;
declare global {
  interface IntlMessages extends Messages {}
}

export const getMessages = async (locale: string): Promise<Messages> =>
  (await import(`@/messages/${locale}.json`)).default;

export default getRequestConfig(async ({ locale }) => ({
  timeZone,
  messages: await getMessages(locale),
}));
