import {NextIntlClientProvider} from 'next-intl';

export default function UseTranslationsLayout({
  children
}: LayoutProps<'/use-translations'>) {
  return (
    <NextIntlClientProvider messages="infer" temp_segment="/use-translations">
      {children}
    </NextIntlClientProvider>
  );
}
