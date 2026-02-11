import {NextIntlClientProvider} from 'next-intl';

export default function ActionsLayout({
  children
}: LayoutProps<'/actions'>) {
  return (
    <NextIntlClientProvider messages="infer" temp_segment="/actions">
      {children}
    </NextIntlClientProvider>
  );
}
