import {NextIntlClientProvider} from 'next-intl';

export default function DynamicImportLayout({
  children
}: LayoutProps<'/dynamic-import'>) {
  return (
    <NextIntlClientProvider messages="infer" temp_segment="/dynamic-import">
      {children}
    </NextIntlClientProvider>
  );
}
