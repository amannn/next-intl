'use client';

import {LocalizedLink, useLocale} from 'next-intl';

export default function ClientLocaleWithoutProvider() {
  return (
    <>
      <p data-testid="ClientLocaleWithoutProvider-locale">{useLocale()}</p>
      <div data-testid="ClientLocaleWithoutProvider-link">
        <LocalizedLink href="/client">Client</LocalizedLink>
      </div>
    </>
  );
}
