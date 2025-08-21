import {PlayIcon} from '@heroicons/react/24/solid';
import Image from 'next/image';
import {useId} from 'react';
import LinkButton from '@/components/LinkButton';
import thumb from './thumb.jpg';

type Props = {
  title: string;
};

export default function CourseBanner({
  title = "Internationalization isn't just translating words"
}: Props) {
  const id = useId();

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-slate-100 p-4 dark:bg-gray-800 lg:flex-row lg:items-center">
      <a
        className="relative size-24 shrink-0 drop-shadow-lg lg:size-32"
        href="https://learn.next-intl.dev"
      >
        <Image
          alt="Video preview"
          className="size-full object-cover"
          height={192}
          src={thumb}
          style={{clipPath: `url(#${id})`}}
          width={192}
        />
        <PlayIcon className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-white" />
      </a>
      <div>
        <h3 className="text-balance text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-balance text-sm text-slate-600 dark:text-slate-400">
          Learn how to build delightful, multilingual apps with Next.js—from the
          basics to advanced patterns, all through a real-world project.
        </p>
        <LinkButton className="mt-3" href="https://learn.next-intl.dev">
          Get started
        </LinkButton>
      </div>
      <svg className="absolute" height="10" viewBox="0 0 10 10" width="10">
        <clipPath clipPathUnits="objectBoundingBox" id={id}>
          <path
            d="M 0,0.5
                C 0,0.0575  0.0575,0  0.5,0
                  0.9425,0  1,0.0575  1,0.5
                  1,0.9425  0.9425,1  0.5,1
                  0.0575,1  0,0.9425  0,0.5"
          />
        </clipPath>
      </svg>
    </div>
  );
}
