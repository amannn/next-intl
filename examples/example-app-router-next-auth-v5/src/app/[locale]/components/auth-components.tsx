"use client";

import { signIn, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FC } from "react";

type SignInProps = {
  provider?: string;
};

export const SignIn: FC<SignInProps> = ({ provider }) => {
  const t = useTranslations("SignIn");
  return <button onClick={() => signIn(provider)}>{t("label")}</button>;
};

export const SignOut: FC = () => {
  const t = useTranslations("SignOut");
  return <button onClick={() => signOut()}>{t("label")}</button>;
};
