import {NextIntlClientProvider} from 'next-intl';

export default function HookTranslationLayout({
  children
}: LayoutProps<'/hook-translation'>) {
  return (
    <NextIntlClientProvider messages="infer" temp_segment="/hook-translation">
      {children}
    </NextIntlClientProvider>
  );
}
