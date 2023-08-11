import Link from 'next/link';
import {ComponentProps} from 'react';
import Chip from './Chip';

type Props = Omit<ComponentProps<typeof Link>, 'children'> & {
  date: string;
  author: string;
  title: string;
  type?: 'article' | 'video';
};

export default function CommunityLink({
  author,
  date,
  title,
  type,
  ...rest
}: Props) {
  return (
    <div>
      <Link className="inline-block py-2" {...rest}>
        <p className="text-xl font-semibold">{title}</p>
        <div className="mt-2">
          {type && (
            <Chip
              className="mr-2 translate-y-[-1px]"
              color={({article: 'green', video: 'yellow'} as const)[type]}
            >
              {{article: 'Article', video: 'Video'}[type]}
            </Chip>
          )}
          <p className="inline-block text-base text-slate-500">{date}</p>
          <p className="inline-block text-base text-slate-500">{' ・ '}</p>
          <p className="inline-block text-base text-slate-500">{author}</p>
        </div>
      </Link>
    </div>
  );
}
