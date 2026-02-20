import {getLocale, getExtracted} from 'next-intl/server';
import Document from '@/components/Document';
import Navigation from './Navigation';

export async function generateMetadata() {
  const t = await getExtracted();
  return {
    title: t({
      message: 'next-intl example',
      description: 'Default meta title if not overridden by pages'
    })
  };
}

export default async function LocaleLayout({children}: LayoutProps<'/'>) {
  const locale = await getLocale();

  return (
    <Document locale={locale}>
      <div className="flex flex-col gap-2.5">
        <Navigation />
        <div className="p-4 flex flex-col gap-4">
          <div>{children}</div>
        </div>
      </div>
    </Document>
  );
}
