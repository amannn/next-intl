import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default async function LocaleLayout({children, params}: Props) {
  return (
    <html lang={params.locale}>
      <head>
        <title>next-intl</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
