export default async function ContactPage({
  params
}: PageProps<'/[locale]/contact'>) {
  const {locale} = await params;

  return (
    <main>
      <p data-testid="locale">{locale}</p>
      <p data-testid="page">contact</p>
    </main>
  );
}
