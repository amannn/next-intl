import {NextIntlClientProvider} from 'next-intl';

export default function FeedPhotoModalLayout({children}: LayoutProps<'/feed'>) {
  return (
    <NextIntlClientProvider
      messages="infer"
      temp_segment="/feed/@modal/(..)photo/[id]"
    >
      {children}
    </NextIntlClientProvider>
  );
}
