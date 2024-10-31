import {Locale, useLocale} from 'next-intl';
import {getLocale} from 'next-intl/server';
import {Link, getPathname, redirect, useRouter} from '@/i18n/routing';

export function RegularComponent() {
  const locale = useLocale();

  locale satisfies Locale;
  'en' satisfies typeof locale;

  // @ts-expect-error
  'fr' satisfies typeof locale;
  // @ts-expect-error
  2 satisfies typeof locale;

  const router = useRouter();
  router.push('/', {locale});

  return (
    <>
      <Link href="/" locale={locale}>
        Home
      </Link>
      {getPathname({
        href: '/',
        locale
      })}
      {redirect({
        href: '/',
        locale
      })}
    </>
  );
}

export async function AsyncComponent() {
  const locale = await getLocale();

  locale satisfies Locale;
  'en' satisfies typeof locale;

  // @ts-expect-error
  'fr' satisfies typeof locale;
  // @ts-expect-error
  2 satisfies typeof locale;

  return (
    <>
      <Link href="/" locale={locale}>
        Home
      </Link>
      {getPathname({
        href: '/',
        locale
      })}
      {redirect({
        href: '/',
        locale
      })}
    </>
  );
}
