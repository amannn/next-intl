import {NextIntlClientProvider} from 'next-intl';

export default function TypeImportsLayout({
  children
}: LayoutProps<'/type-imports'>) {
  return (
    <NextIntlClientProvider messages="infer">
      {children}
    </NextIntlClientProvider>
  );
}
