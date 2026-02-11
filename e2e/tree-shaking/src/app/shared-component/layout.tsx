import {NextIntlClientProvider} from 'next-intl';

export default function SharedComponentLayout({
  children
}: LayoutProps<'/shared-component'>) {
  return (
    <NextIntlClientProvider messages="infer">
      {children}
    </NextIntlClientProvider>
  );
}
