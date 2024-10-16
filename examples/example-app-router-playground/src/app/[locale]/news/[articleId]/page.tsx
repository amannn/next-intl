import {Metadata} from 'next';
import {useTranslations} from 'next-intl';
import {getPathname, routing, Locale} from '@/i18n/routing';

type Props = {
  params: Promise<{
    locale: Locale;
    articleId: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  let canonical = getPathname({
    href: {
      pathname: '/news/[articleId]',
      params: {articleId: params.articleId}
    },
    locale: params.locale
  });

  if (params.locale !== routing.defaultLocale) {
    canonical = '/' + params.locale + canonical;
  }

  return {alternates: {canonical}};
}

export default async function NewsArticle(props: Props) {
  const params = await props.params;
  const t = useTranslations('NewsArticle');
  return <h1>{t('title', {articleId: params.articleId})}</h1>;
}
