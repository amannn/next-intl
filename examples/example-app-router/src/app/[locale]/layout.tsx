import {getTranslations} from 'next-intl/server';
import {ReactNode} from 'react';
import BaseLayout from '@/components/BaseLayout';
import {routing} from '@/i18n/routing';
import './styles.css';

type Props = {
  children: ReactNode;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const dynamicParams = false;

export async function generateMetadata() {
  const t = await getTranslations('LocaleLayout');

  return {
    title: t('title')
  };
}

export default async function LocaleLayout({children}: Props) {
  return <BaseLayout>{children}</BaseLayout>;
}
