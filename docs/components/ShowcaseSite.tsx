import clsx from 'clsx';
import Image from 'next/image';

type Props = {
  className?: string;
  title: string;
  href: string;
  screenUrl: string;
};

export default function ShowcaseSite({
  className,
  href,
  screenUrl,
  title
}: Props) {
  return (
    <a
      className={clsx(
        className,
        'group relative block aspect-[16/9] w-[300px] transition-all duration-300 hover:scale-105 hover:shadow-lg md:w-[600px]'
      )}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <Image
        alt={title}
        className="rounded-md object-cover object-top"
        fill
        sizes="(min-width: 1024px) 600px, 100vw"
        src={screenUrl}
      />
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-1 rounded-md border bg-white px-3 py-1 font-semibold text-slate-900 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        {title}
      </p>
    </a>
  );
}
