import Link from 'next/link';
import {ComponentProps} from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'children'> & {
  meta: string;
  title: string;
};

export default function BlogArticleLink({meta, title, ...rest}: Props) {
  return (
    <Link className="inline-block py-2" {...rest}>
      <p className="text-xl font-semibold">{title}</p>
      <p className="mt-2 text-slate-500">{meta}</p>
    </Link>
  );
}
