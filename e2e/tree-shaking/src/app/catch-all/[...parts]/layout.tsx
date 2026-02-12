import {NextIntlClientProvider} from 'next-intl';

export default function CatchAllLayout({
  children
}: LayoutProps<'/catch-all/[...parts]'>) {
  return (
    <NextIntlClientProvider messages="infer">{children}</NextIntlClientProvider>
  );
}
