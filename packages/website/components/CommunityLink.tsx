import clsx from 'clsx';
import Link from 'next/link';
import {ComponentProps} from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'children'> & {
  meta: string;
  title: string;
  type?: 'article' | 'video';
};

export default function CommunityLink({meta, title, type, ...rest}: Props) {
  return (
    <Link className="inline-block py-2" {...rest}>
      <p className="text-xl font-semibold">{title}</p>
      <div className="mt-2">
        {type && (
          <p
            className={clsx(
              'mr-2 inline-block rounded-sm px-2 py-1 text-sm font-semibold',
              {
                article:
                  'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-100',
                video:
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-100'
              }[type]
            )}
          >
            {{article: 'Article', video: 'Video'}[type]}
          </p>
        )}
        <p className="inline-block text-base text-slate-500">{meta}</p>
      </div>
    </Link>
  );
}
