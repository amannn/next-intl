import {NextIntlClientProvider} from 'next-intl';

export default function FeedPhotoModalLayout({
  children
}: LayoutProps<'/photo/[id]'>) {
  return (
    <NextIntlClientProvider
      messages="infer"
      temp_segment="/feed/@modal/(..)photo/[id]"
    >
      {children}
    </NextIntlClientProvider>
  );
}
