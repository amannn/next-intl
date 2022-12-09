import Meta from './Meta';
import NextIntlProvider from './NextIntlProvider';

type Props = {
  params: {
    locale: string;
  };
};

export default function Head({params: {locale}}: Props) {
  return (
    // @ts-expect-error Waiting for TypeScript to support server components
    <NextIntlProvider locale={locale}>
      <Meta />
    </NextIntlProvider>
  );
}
