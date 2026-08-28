export default async function IndexPage({params}: PageProps<'/[locale]'>) {
  const {locale} = await params;

  return (
    <main>
      <p data-testid="locale">{locale}</p>
      <p data-testid="page">index</p>
    </main>
  );
}
