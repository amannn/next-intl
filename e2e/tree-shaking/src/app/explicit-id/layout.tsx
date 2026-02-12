import {NextIntlClientProvider} from 'next-intl';

export default function ExplicitIdLayout({
  children
}: LayoutProps<'/explicit-id'>) {
  return (
    <NextIntlClientProvider messages="infer">{children}</NextIntlClientProvider>
  );
}
