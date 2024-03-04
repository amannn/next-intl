import clsx from 'clsx';
import Image from 'next/image';

type Props = {
  bgUrlBright?: string;
  bgUrlDark?: string;
  className?: string;
  featured?: boolean;
  href: string;
  linkSubtitle: string;
  linkTitle: string;
  portraitUrl: string;
  position: string;
  quote: string;
  userName: string;
  blendModeDark?: 'multiply' | 'color-burn' | 'soft-light' | 'overlay';
};

export default function UserTestimonial({
  bgUrlBright,
  bgUrlDark,
  blendModeDark,
  className,
  featured,
  href,
  linkSubtitle,
  linkTitle,
  portraitUrl,
  position,
  quote,
  userName
}: Props) {
  return (
    <div
      className={clsx(
        className,
        'relative -mx-4 flex overflow-hidden rounded-sm p-4 lg:mx-0 lg:p-6',
        featured && 'bg-white dark:bg-slate-800 lg:col-span-2'
      )}
    >
      {bgUrlBright && <BgImage className="dark:hidden" src={bgUrlBright} />}
      {bgUrlDark && (
        <BgImage
          blendMode={blendModeDark}
          className="hidden dark:block"
          src={bgUrlDark}
        />
      )}
      {featured && (
        <div
          className="absolute -right-1 -top-1 hidden h-1 w-1 dark:block"
          style={{boxShadow: 'rgba(255,255,255,0.15) 0px 0px 190px 140px'}}
        />
      )}
      <div
        className={clsx(
          'relative mt-auto flex flex-col gap-4',
          featured && 'pt-20'
        )}
      >
        <div>
          <div className="flex items-center">
            <Image
              alt={userName}
              className="rounded-full"
              height={48}
              src={portraitUrl}
              width={48}
            />
            <div className="ml-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {userName}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{position}</p>
            </div>
          </div>
          <p
            className={clsx(
              'mt-4 max-w-3xl indent-[-0.4rem] text-slate-900 dark:text-white lg:text-lg'
            )}
          >
            “{quote}”
          </p>
        </div>
        {linkTitle && (
          <div className="mt-auto">
            <a
              className="group inline-block"
              href={href}
              rel="noreferrer"
              target="_blank"
            >
              <span
                className={clsx(
                  'font-semibold dark:text-white',
                  featured ? 'text-sky-600' : 'text-slate-900'
                )}
              >
                {linkTitle}{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  {'→'}
                </span>
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                {linkSubtitle}
              </p>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function BgImage({
  blendMode,
  className,
  src
}: {
  blendMode?: Props['blendModeDark'];
  className?: string;
  src: string;
}) {
  return (
    <Image
      alt=""
      className={clsx(
        className,
        'absolute right-0 top-0 w-full max-w-lg',
        blendMode &&
          {
            multiply: 'mix-blend-multiply',
            'color-burn': 'mix-blend-color-burn',
            'soft-light': 'mix-blend-soft-light',
            overlay: 'mix-blend-overlay'
          }[blendMode],
        className
      )}
      height={170}
      src={src}
      width={480}
    />
  );
}
