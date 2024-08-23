import {Metadata} from 'next';
import {useTranslations} from 'next-intl';
import {defaultLocale, getPathname} from '@/navigation';
import {Locale} from '@/types';

type Props = {
  params: {
    locale: Locale;
    articleId: string;
  };
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  let canonical = getPathname({
    href: {
      pathname: '/news/[articleId]',
      params: {articleId: params.articleId}
    },
    locale: params.locale
  });

  if (params.locale !== defaultLocale) {
    canonical = '/' + params.locale + canonical;
  }

  return {alternates: {canonical}};
}

export default function NewsArticle({params}: Props) {
  const t = useTranslations('NewsArticle');
  return <h1>{t('title', {articleId: params.articleId})}</h1>;
}
