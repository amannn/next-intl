import {NextIntlClientProvider} from 'next-intl';

export default function OptionalLayout({
  children
}: LayoutProps<'/optional/[[...parts]]'>) {
  return (
    <NextIntlClientProvider messages="infer">
      {children}
    </NextIntlClientProvider>
  );
}
