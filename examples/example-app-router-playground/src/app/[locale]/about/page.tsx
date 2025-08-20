export default async function AboutPage({
  params
}: PageProps<'/[locale]/about'>) {
  const {locale} = await params;
  const Content = (await import(`./${locale}.mdx`)).default;
  return <Content />;
}
