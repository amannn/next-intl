import {Link} from '@/i18n/navigation';

export default async function IndexPage({params}: PageProps<'/[locale]'>) {
  const {locale} = await params;

  return (
    <main>
      <p data-testid="locale">{locale}</p>
      <Link href="/" locale="en">
        Switch to English
      </Link>
      <Link href="/" locale="de">
        Switch to German
      </Link>
    </main>
  );
}
