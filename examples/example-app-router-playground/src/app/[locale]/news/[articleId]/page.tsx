import {Metadata} from 'next';
import {Locale, useTranslations} from 'next-intl';
import {use} from 'react';
import {getPathname} from '@/i18n/navigation';

export async function generateMetadata({
  params
}: PageProps<'/[locale]/news/[articleId]'>): Promise<Metadata> {
  const {locale, articleId} = await params;

  return {
    alternates: {
      canonical: getPathname({
        href: {
          pathname: '/news/[articleId]',
          params: {articleId}
        },
        locale: locale as Locale
      })
    }
  };
}

export default function NewsArticle(
  props: PageProps<'/[locale]/news/[articleId]'>
) {
  const {articleId} = use(props.params);
  const v2 = use(props.searchParams).v2 === 'true';
  const t = useTranslations('NewsArticle');
  return (
    <h1>
      {t('title', {articleId})}
      {v2 && <>(v2)</>}
    </h1>
  );
}
