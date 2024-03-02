import { auth } from "@/auth";
import { FC } from "react";

const ProfilePage: FC = async () => {
  const session = await auth();

  return <pre>{JSON.stringify(session, null, 2)}</pre>;
};

export default ProfilePage;
