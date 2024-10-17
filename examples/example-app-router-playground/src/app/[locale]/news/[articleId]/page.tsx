import {Metadata} from 'next';
import {useTranslations} from 'next-intl';
import {getPathname, Locale} from '@/i18n/routing';

type Props = {
  params: {
    locale: Locale;
    articleId: string;
  };
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
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

export default function NewsArticle({params}: Props) {
  const t = useTranslations('NewsArticle');
  return <h1>{t('title', {articleId: params.articleId})}</h1>;
}
