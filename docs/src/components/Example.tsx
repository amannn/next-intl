import {clsx} from 'clsx';
import Image from 'next/image';
import useLocationHash from '@/hooks/useLocationHash';
import LinkButton from './LinkButton';

type Props = {
  badges?: Array<string>;
  demoLink?: string;
  description: string;
  id: string;
  image?: string;
  name: string;
  sourceLink: string;
  featured?: boolean;
};

export default function Example({
  badges,
  demoLink,
  description,
  featured,
  id,
  image,
  name,
  sourceLink
}: Props) {
  const locationHash = useLocationHash();
  const isActive = locationHash === id;

  return (
    <div
      className={clsx(
        'relative max-w-lg',
        featured &&
          'rounded-md border border-slate-200 shadow-lg shadow-slate-100 dark:border-slate-800 dark:shadow-slate-900'
      )}
    >
      {isActive && (
        <div className="absolute -left-6 top-0 h-full w-1 bg-sky-200 dark:bg-sky-900" />
      )}
      {image && (
        // eslint-disable-next-line react/jsx-no-target-blank
        <a
          className="relative mb-3 block aspect-[512/350] max-w-lg overflow-hidden rounded-md after:!hidden"
          href={sourceLink}
          target="_blank"
        >
          <Image
            alt="Screenshot"
            className="absolute inset-0 h-full w-full rounded-sm object-cover "
            height={350}
            src={image}
            width={512}
          />
        </a>
      )}
      <div className={clsx('relative', featured && 'px-4 pb-4 pt-1')}>
        <a
          aria-label="Permalink for this example"
          className={clsx(
            'subheading-anchor absolute right-0 top-0',
            image ? 'scroll-m-[28rem]' : 'scroll-m-[5rem]'
          )}
          href={`#${id}`}
          id={id}
        >
          {/* Styled by nextra via CSS class */}
        </a>
        <h2 className="flex scroll-mt-8 items-center !text-lg font-semibold">
          {name}
        </h2>
        <div className="mt-2">
          <p className="mt-2 max-w-lg text-base text-slate-600 dark:text-slate-400">
            {description}
          </p>
          {badges && (
            <div className="mt-2 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium  dark:border-gray-700"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2">
            {featured ? (
              <LinkButton className="mt-2" href={sourceLink}>
                Source
              </LinkButton>
            ) : (
              <a
                className="inline-block text-base text-primary-600 underline"
                href={sourceLink}
                rel="noreferrer"
                target="_blank"
              >
                Source
              </a>
            )}
            {demoLink && (
              <>
                <span className="inline-block text-base text-slate-500">
                  {' ・ '}
                </span>
                <a
                  className="inline-block text-base text-primary-600 underline"
                  href={demoLink}
                  rel="noreferrer"
                  target="_blank"
                >
                  Demo
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
