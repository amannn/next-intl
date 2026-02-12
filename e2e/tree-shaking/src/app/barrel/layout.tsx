import {NextIntlClientProvider} from 'next-intl';

export default function BarrelLayout({children}: LayoutProps<'/barrel'>) {
  return (
    <NextIntlClientProvider messages="infer">{children}</NextIntlClientProvider>
  );
}
