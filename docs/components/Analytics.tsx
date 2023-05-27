import Script from 'next/script';

export default function Analytics() {
  return (
    <>
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
