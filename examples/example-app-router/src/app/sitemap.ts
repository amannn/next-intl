import {MetadataRoute} from 'next';
import {locales, defaultLocale, host} from '@/config';
import {getPathname} from '@/navigation';

export default function sitemap(): MetadataRoute.Sitemap {
  return [getEntry('/'), getEntry('/pathnames')];
}

type Href = Parameters<typeof getPathname>[0]['href'];

function getEntry(href: Href) {
  return {
    url: getUrl(href, defaultLocale),
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, getUrl(href, locale)])
      )
    }
  };
}

function getUrl(href: Href, locale: (typeof locales)[number]) {
  const pathname = getPathname({locale, href});
  return `${host}/${locale}${pathname === '/' ? '' : pathname}`;
}
