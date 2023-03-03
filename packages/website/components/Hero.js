import Link from 'next/link';
import HeroCode from './HeroCode';
import LinkButton from './LinkButton';

export default function Hero({
  description,
  getStarted,
  rscAnnouncement,
  titleRegular,
  titleStrong,
  viewOnGithub
}) {
  return (
    <div className="dark overflow-hidden">
      <div className="relative max-w-full overflow-hidden bg-slate-850 py-16 sm:px-2 lg:py-52 lg:px-0">
        <div className="absolute top-0 left-0 h-[20500px] w-[20500px] -translate-x-[47.5%] rounded-full bg-gradient-to-b from-slate-900 via-cyan-500 md:top-1" />
        <div className="relative mx-auto flex max-w-[90rem] flex-col gap-16 px-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <h1 className="inline bg-gradient-to-r from-white via-sky-100 to-primary bg-clip-text text-3xl leading-tight tracking-tight text-transparent lg:text-5xl">
              <strong className="font-semibold">{titleStrong}</strong>{' '}
              <span className="font-light">{titleRegular}</span>
            </h1>

            <p className="mt-3 max-w-xl text-lg leading-normal tracking-tight text-sky-100/70 lg:mt-4 lg:text-2xl lg:leading-normal">
              {description}
            </p>
            <div className="mt-8 flex gap-4 lg:mt-10">
              <LinkButton href="/docs">{getStarted}</LinkButton>
              <LinkButton
                href="https://github.com/amannn/next-intl"
                target="_blank"
                variant="secondary"
              >
                {viewOnGithub}
              </LinkButton>
            </div>
            {/* eslint-disable-next-line @next/next/link-passhref */}
            <Link
              className="mt-10 inline-block flex border border-green-300/50 px-4 py-3 font-semibold text-green-300 transition-colors hover:border-white/50 hover:text-white lg:mt-16"
              href="/docs/next-13"
            >
              <span className="mr-3 inline-block">📣</span>{' '}
              <span>{rscAnnouncement}</span>
            </Link>
          </div>
          <div className="max-w-[44rem] xl:-mr-8 2xl:-mr-16">
            <HeroCode />
          </div>
        </div>
      </div>
    </div>
  );
}
