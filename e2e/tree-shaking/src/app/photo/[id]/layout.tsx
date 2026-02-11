import {NextIntlClientProvider} from 'next-intl';

export default function PhotoLayout({children}: LayoutProps<'/photo/[id]'>) {
  return (
    <NextIntlClientProvider messages="infer">
      {children}
    </NextIntlClientProvider>
  );
}
