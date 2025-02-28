import {Locale} from 'next-intl';

type Props = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function AboutPage({params}: Props) {
  const {locale} = await params;
  const Content = (await import(`./${locale}.mdx`)).default;
  return <Content />;
}
