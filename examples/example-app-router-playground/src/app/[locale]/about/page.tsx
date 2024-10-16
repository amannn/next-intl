type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AboutPage(props: Props) {
  const params = await props.params;
  const Content = (await import(`./${params.locale}.mdx`)).default;
  return <Content />;
}
