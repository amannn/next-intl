import {NextIntlClientProvider} from 'next-intl';

export default function CatalogGroupLayout({children}: LayoutProps<'/'>) {
  return (
    <section>
      <h1>Groups two pages with same provider</h1>
      <NextIntlClientProvider messages="infer" temp_segment="/(group)">
        {children}
      </NextIntlClientProvider>
    </section>
  );
}
