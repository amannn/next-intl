import clsx from 'clsx';
import Script from 'next/script';

type Props = {
  className?: string;
  src: string;
  title: string;
};

export default function BlogVimeoVideo({className, src, title}: Props) {
  return (
    <>
      <div
        className={clsx(
          'relative w-full overflow-hidden rounded-lg shadow-lg',
          className
        )}
        style={{padding: '56.25% 0 0 0'}}
      >
        <iframe
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          className="absolute left-0 top-0 h-full w-full border-0"
          frameBorder={0}
          referrerPolicy="strict-origin-when-cross-origin"
          src={src}
          title={title}
        />
      </div>
      <Script
        src="https://player.vimeo.com/api/player.js"
        strategy="lazyOnload"
      />
    </>
  );
}
