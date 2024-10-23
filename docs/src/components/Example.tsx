import {clsx} from 'clsx';
import Image from 'next/image';
import useLocationHash from 'hooks/useLocationHash';

type Props = {
  demoLink?: string;
  description: string;
  id: string;
  image?: string;
  name: string;
  sourceLink: string;
};

export default function Example({
  demoLink,
  description,
  id,
  image,
  name,
  sourceLink
}: Props) {
  const locationHash = useLocationHash();
  const isActive = locationHash === id;

  return (
    <div className="relative max-w-lg">
      {isActive && (
        <div className="absolute -left-6 top-0 h-full w-1 bg-sky-200 dark:bg-sky-900" />
      )}
      {image && (
        <div className="relative mb-3 aspect-[512/350] max-w-lg shadow-sm">
          <Image
            alt="Screenshot"
            className="absolute inset-0 h-full w-full rounded-sm object-cover "
            height={350}
            src={image}
            width={512}
          />
          <div className="absolute inset-0 shadow-[inset_0_0_50px_0_rgba(0,0,0,0.04)]" />
        </div>
      )}
      <div className="relative">
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
          <div className="mt-2">
            <a
              className="inline-block text-base text-primary-600 underline"
              href={sourceLink}
              rel="noreferrer"
              target="_blank"
            >
              Source
            </a>
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
