import {NextIntlClientProvider} from 'next-intl';

export default function LinkedDependencyLayout({
  children
}: LayoutProps<'/linked-dependency'>) {
  return (
    <NextIntlClientProvider messages="infer">{children}</NextIntlClientProvider>
  );
}
