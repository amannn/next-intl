import { FC, PropsWithChildren } from "react";

type RootLayoutProps = PropsWithChildren;

const RootLayout: FC<RootLayoutProps> = ({ children }) => <>{children}</>;

export default RootLayout;
