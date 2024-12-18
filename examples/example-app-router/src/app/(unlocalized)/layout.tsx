import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export default function RootLayout({children}: Props) {
  // No need for a layout, as this only renders a redirect
  return children;
}
