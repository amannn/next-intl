import {useLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {getGuitarBySlug} from '../../../../db';

type Props = {
  params: {
    slug: string;
  };
};

export default function Detail({params: {slug}}: Props) {
  const locale = useLocale();
  const guitar = getGuitarBySlug(slug, locale);

  if (!guitar) {
    return notFound();
  }

  return (
    <div>
      <h1>{guitar.name}</h1>
      <p>{guitar.description}</p>
    </div>
  );
}
