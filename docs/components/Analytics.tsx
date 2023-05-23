import {Analytics as VercelAnalytics} from '@vercel/analytics/react';
import Script from 'next/script';

// Currently there are multiple providers being
// evaluated, ultimately only one should remain.
// See: https://github.com/umami-software/umami/issues/2051

export default function Analytics() {
  return (
    <>
      {/* Vercel */}
      <VercelAnalytics />

      {/* Umami */}
      {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
        <Script
          async
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          defer
          src="/u/script.js"
        />
      )}
    </>
  );
}
