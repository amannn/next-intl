type Props = {
  params: {
    locale: string;
  };
};

export default async function AboutPage({params}: Props) {
  const Content = (await import(`./${params.locale}.mdx`)).default;
  return <Content />;
}
