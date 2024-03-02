"use client";

import { locales } from "@/i18n";
import { Link, usePathname } from "@/navigation";
import { FC } from "react";

export const LocaleSwitch: FC = () => {
  const pathname = usePathname();
  return (
    <div style={{ display: "flex", gap: 5 }}>
      {locales.map((locale) => (
        <Link key={locale} href={pathname} locale={locale}>
          {locale}
        </Link>
      ))}
    </div>
  );
};
