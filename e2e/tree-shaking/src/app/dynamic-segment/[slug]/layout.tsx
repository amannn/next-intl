import {NextIntlClientProvider} from 'next-intl';

export default function DynamicSegmentLayout({
  children
}: LayoutProps<'/dynamic-segment/[slug]'>) {
  return (
    <NextIntlClientProvider
      messages="infer"
      temp_segment="/dynamic-segment/[slug]"
    >
      {children}
    </NextIntlClientProvider>
  );
}
