import {NextIntlClientProvider} from 'next-intl';

export default function LoadingLayout({
  children
}: LayoutProps<'/loading'>) {
  return (
    <NextIntlClientProvider messages="infer" temp_segment="/loading">
      {children}
    </NextIntlClientProvider>
  );
}
