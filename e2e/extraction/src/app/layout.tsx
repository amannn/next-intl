import {getExtracted} from 'next-intl/server';
import type {ReactNode} from 'react';

export default async function Layout({children}: {children: ReactNode}) {
  const t = await getExtracted();
  return (
    <html lang="en">
      <body>
        <header>{t('Layout header')}</header>
        {children}
      </body>
    </html>
  );
}
