"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Login() {
  const t = useTranslations("Login");
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error) setError(undefined);

    const formData = new FormData(event.currentTarget);

    const result = await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      callbackUrl: searchParams.get("callbackUrl") ?? undefined,
    });

    if (result?.error) setError(result.error);
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: 300,
      }}
    >
      <label style={{ display: "flex" }}>
        <span style={{ display: "inline-block", flexGrow: 1, minWidth: 100 }}>
          {t("username")}
        </span>
        <input name="username" type="text" />
      </label>
      <label style={{ display: "flex" }}>
        <span style={{ display: "inline-block", flexGrow: 1, minWidth: 100 }}>
          {t("password")}
        </span>
        <input name="password" type="password" />
      </label>
      {error && <p>{t("error", { error })}</p>}
      <button type="submit">{t("submit")}</button>
    </form>
  );
}
