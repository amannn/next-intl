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

      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GA_TRACKING_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}');
            `}
          </Script>
        </>
      )}

      {/* Umami */}
      {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
        <Script
          async
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          defer
          src="/stats/umami.js"
        />
      )}
    </>
  );
}
