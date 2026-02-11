import {NextIntlClientProvider} from 'next-intl';

export default function CatchAllLayout({
  children
}: LayoutProps<'/catch-all/[...parts]'>) {
  return (
    <NextIntlClientProvider
      messages="infer"
      temp_segment="/catch-all/[...parts]"
    >
      {children}
    </NextIntlClientProvider>
  );
}
