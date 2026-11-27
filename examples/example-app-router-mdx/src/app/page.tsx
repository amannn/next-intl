import {useExtracted} from 'next-intl';
import Link from 'next/link';

export default function Index() {
  const t = useExtracted();

  return (
    <section>
      <h1>{t('Stories worth sharing')}</h1>
      <p className="intro">
        {t('A blog written once in MDX, available in English and German.')}
      </p>
      <article className="post-card">
        <p className="eyebrow">{t('First post')}</p>
        <h2>{t('Welcome to the blog')}</h2>
        <p>{t('A first post about writing and sharing ideas.')}</p>
        <Link href="/blog/welcome">
          {t('Read article')} <span aria-hidden="true">→</span>
        </Link>
      </article>
    </section>
  );
}
