import useLocationHash from 'hooks/useLocationHash';
import Image from 'next/image';

type Props = {
  demoLink?: string;
  description: string;
  hash: string;
  image?: string;
  name: string;
  sourceLink: string;
};

export default function Example({
  demoLink,
  description,
  hash,
  image,
  name,
  sourceLink
}: Props) {
  const locationHash = useLocationHash();
  const isActive = locationHash === hash;

  return (
    <div className="relative max-w-lg scroll-m-4" id={hash}>
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
      <h2 className="flex scroll-mt-8 items-center text-xl font-semibold">
        {name}
      </h2>
      <div className="mt-2">
        <p className="mt-2 max-w-lg text-base text-slate-600 dark:text-slate-400">
          {description}
        </p>
        <div className="mt-2">
          <a
            className="nx-text-primary-600 inline-block text-base underline"
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
                className="nx-text-primary-600 inline-block text-base underline"
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
  );
}
