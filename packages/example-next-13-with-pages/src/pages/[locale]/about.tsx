import React from "react";
import type { GetStaticPropsContext } from "next";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "../../components/LocaleSwitcher";
import PageLayout from "../../components/PageLayout";

export default function AboutPage() {
  const t = useTranslations("About");

  return (
    <PageLayout title={t("title")}>
      <p>{t("description")}</p>
      <LocaleSwitcher />
    </PageLayout>
  );
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${params?.locale}.json`))
        .default,
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { locale: "de" } }, { params: { locale: "en" } }],
    fallback: false,
  };
}
