import {NextIntlClientProvider} from 'next-intl';

export default function UseTranslationsLayout({
  children
}: LayoutProps<'/use-translations'>) {
  return (
    <NextIntlClientProvider messages="infer">
      {children}
    </NextIntlClientProvider>
  );
}
