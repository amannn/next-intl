import {NextIntlClientProvider} from 'next-intl';

export default function HomeLayout({children}: LayoutProps<'/'>) {
  return (
    <NextIntlClientProvider messages="infer">{children}</NextIntlClientProvider>
  );
}
