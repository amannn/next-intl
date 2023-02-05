import { LocalizedLink, useLocale, useTranslations } from "next-intl";
import LocaleSwitcher from "../../components/LocaleSwitcher";
import PageLayout from "../../components/PageLayout";

export default function Index() {
  const t = useTranslations("Index");
  const locale = useLocale();

  return (
    <PageLayout title={t("title")}>
      <p>{t("description")}</p>
      <LocaleSwitcher />
      <p>
        <LocalizedLink locale={locale} href="/about">
          {t("navigateToAbout")}
        </LocalizedLink>
      </p>
    </PageLayout>
  );
}
