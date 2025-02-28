import {Metadata} from 'next';
import {useTranslations} from 'next-intl';
import {getLocale} from 'next-intl/server';
import {use} from 'react';
import {getPathname} from '@/i18n/navigation';

type Props = {
  params: Promise<{
    articleId: string;
  }>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {articleId} = await params;
  const locale = await getLocale();

  return {
    alternates: {
      canonical: getPathname({
        href: {
          pathname: '/news/[articleId]',
          params: {articleId}
        },
        locale
      })
    }
  };
}

export default function NewsArticle({params}: Props) {
  const {articleId} = use(params);
  const t = useTranslations('NewsArticle');
  return <h1>{t('title', {articleId})}</h1>;
}
