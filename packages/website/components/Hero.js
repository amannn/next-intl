import Link from 'next/link';
import HeroCode from './HeroCode';
import LinkButton from './LinkButton';

export default function Hero() {
  return (
    <div className="dark overflow-hidden bg-slate-900">
      <div className="py-16 sm:px-2 lg:relative lg:py-44 lg:px-0">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-16 px-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative">
            <div className="relative">
              <div className="max-w-2xl">
                <h1 className="inline bg-gradient-to-r from-primary via-sky-100 to-primary bg-clip-text text-3xl leading-tight tracking-tight text-transparent lg:text-5xl">
                  <span className="font-semibold">
                    Internationalization for Next.js
                  </span>{' '}
                  <span className="font-light">that gets out of your way.</span>
                </h1>
              </div>
              <p className="mt-3 max-w-xl text-lg leading-normal tracking-tight text-sky-100/70 lg:text-2xl">
                Support multiple languages, with your code becoming simpler
                instead of more complex.
              </p>
              <div className="mt-8 flex gap-4">
                <LinkButton href="/docs">Get started</LinkButton>
                <LinkButton
                  href="https://github.com/amannn/next-intl"
                  target="_blank"
                  variant="secondary"
                >
                  View on GitHub
                </LinkButton>
              </div>
              {/* eslint-disable-next-line @next/next/link-passhref */}
              <Link
                className="mt-10 inline-block border border-green-300/50 px-4 py-3 font-semibold text-green-300 transition-colors hover:border-white/50 hover:text-white lg:mt-16"
                href="/docs/next-13"
              >
                <span className="mr-2 inline-block">📣</span> Support for
                Next.js 13 and the app directory is coming →
              </Link>
            </div>
          </div>
          <div className="relative max-w-[44rem] xl:-mr-8 2xl:-mr-16">
            <HeroCode />
          </div>
        </div>
      </div>
    </div>
  );
}
