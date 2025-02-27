import {Metadata} from 'next';
import {useTranslations} from 'next-intl';
import {use} from 'react';
import {Locale} from '@/i18n/routing';
import {getPathname} from '@/i18n/navigation';

type Props = {
  params: Promise<{
    locale: Locale;
    articleId: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  return {
    alternates: {
      canonical: getPathname({
        href: {
          pathname: '/news/[articleId]',
          params: {articleId: params.articleId}
        },
        locale: params.locale
      })
    }
  };
}

export default function NewsArticle(props: Props) {
  const params = use(props.params);
  const t = useTranslations('NewsArticle');
  return <h1>{t('title', {articleId: params.articleId})}</h1>;
}
