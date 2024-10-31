import {Locale} from 'next-intl';

type Props = {
  params: {
    locale: Locale;
  };
};

export default async function AboutPage({params}: Props) {
  const Content = (await import(`./${params.locale}.mdx`)).default;
  return <Content />;
}
