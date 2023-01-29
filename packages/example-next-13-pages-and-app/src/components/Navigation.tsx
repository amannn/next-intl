import { LocalizedLink, useTranslations } from "next-intl";

export default function Navigation() {
  const t = useTranslations("Navigation");

  return (
    <nav style={{ display: "flex", gap: 10 }}>
      <LocalizedLink href="/">{t("home")}</LocalizedLink>
      <LocalizedLink href="/client">{t("client")}</LocalizedLink>
      <LocalizedLink href="/nested">{t("nested")}</LocalizedLink>
      <LocalizedLink href="/next-page">{t("next-page")}</LocalizedLink>
    </nav>
  );
}
