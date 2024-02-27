import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { FC } from "react";

const pages = {
  "/": "home",
  "/profile": "profile",
} as const;

export const MainNavigation: FC = () => {
  const t = useTranslations("Navigation");

  return (
    <div style={{ display: "flex", gap: 5 }}>
      {Object.entries(pages).map(([path, key]) => (
        <Link key={path} href={path}>
          {t(key)}
        </Link>
      ))}
    </div>
  );
};
