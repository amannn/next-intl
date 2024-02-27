import { auth } from "@/auth";
import { SignIn, SignOut } from "./components/auth-components";
import { FC } from "react";

const IndexPage: FC = async () => {
  const session = await auth();

  return <div>{session ? <SignOut /> : <SignIn />}</div>;
};

export default IndexPage;
