import {NextIntlClientProvider} from 'next-intl';

export default function PhotoLayout({
  children
}: LayoutProps<'/photo'>) {
  return (
    <NextIntlClientProvider messages="infer" temp_segment="/photo/[id]">
      {children}
    </NextIntlClientProvider>
  );
}
