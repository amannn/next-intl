import {Metadata} from 'next';
import {Locale, useTranslations} from 'next-intl';
import {use} from 'react';
import {getPathname} from '@/i18n/navigation';

type Props = {
  params: Promise<{
    locale: Locale;
    articleId: string;
  }>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, articleId} = await params;

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

export default function NewsArticle(props: Props) {
  const {articleId} = use(props.params);
  const t = useTranslations('NewsArticle');
  return <h1>{t('title', {articleId})}</h1>;
}
