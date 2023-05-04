import {notFound} from 'next/navigation';
import {useLocale} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {ReactNode} from 'react';
import LocaleSwitcher from '../../components/LocaleSwitcher';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export async function generateMetadata() {
  const t = await getTranslations('LocaleLayout');
  return {title: t('title')};
}

export default function LocaleLayout({children, params}: Props) {
  const locale = useLocale();

  // Show a 404 error for unknown locales
  if (params.locale !== locale) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <div style={{maxWidth: 500}}>
          {children}
          <LocaleSwitcher />
        </div>
      </body>
    </html>
  );
}
