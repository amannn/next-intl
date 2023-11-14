import {useTranslations} from 'next-intl';

type Props = {
  params: {
    articleId: string;
  };
};

export default function NewsArticle({params}: Props) {
  const t = useTranslations('NewsArticle');
  return <h1>{t('title', {articleId: params.articleId})}</h1>;
}
