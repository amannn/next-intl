import Head from 'next/head';
import {useTranslations} from 'next-intl';
import {ReactNode} from 'react';

type Props = {
  children?: ReactNode;
  title: string;
};

export default function PageLayout({children, title}: Props) {
  const t = useTranslations('PageLayout');

  return (
    <>
      <Head>
        <title>{[title, t('pageTitle')].join(' - ')}</title>
      </Head>
      <div
        style={{
          padding: 24,
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1.5
        }}
      >
        <div style={{maxWidth: 510}}>
          <h1>{title}</h1>
          {children}
        </div>
      </div>
    </>
  );
}
