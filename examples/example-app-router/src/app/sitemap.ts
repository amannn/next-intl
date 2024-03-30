import {MetadataRoute} from 'next';
import {locales, pathnames, defaultLocale} from 'config';
import {getPathname} from 'navigation';

const HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const keys = Object.keys(pathnames) as Array<keyof typeof pathnames>;

  function getUrl(
    key: keyof typeof pathnames,
    locale: (typeof locales)[number]
  ) {
    const pathname = getPathname({locale, href: key});
    return `${HOST}/${locale}${pathname === '/' ? '' : pathname}`;
  }

  const entries = [];
  for (const key of keys) {
    entries.push({
      url: getUrl(key, defaultLocale),
      alternates: {
        languages: Object.fromEntries(
          locales.map((locale) => [locale, getUrl(key, locale)])
        )
      }
    });
  }

  return entries;
}
