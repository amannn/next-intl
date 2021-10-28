import {useTranslations} from 'next-intl';
import Head from 'next/head';
import {ReactNode} from 'react';
import Navigation from './Navigation';

type Props = {
  children: ReactNode;
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
        <Navigation />
        <div style={{maxWidth: 510}}>
          <h1>{title}</h1>
          {children}
        </div>
      </div>
    </>
  );
}

PageLayout.messages = ['PageLayout', ...Navigation.messages];
