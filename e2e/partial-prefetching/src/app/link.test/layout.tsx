'use client';

import {NextIntlClientProvider} from 'next-intl';
import type {ReactNode} from 'react';

export default function LinkTestLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <body>
        <NextIntlClientProvider locale="en" messages={null}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
