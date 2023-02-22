import HeroCode from './HeroCode';
import LinkButton from './LinkButton';

export default function Hero() {
  return (
    <div className="overflow-hidden bg-slate-900 dark:-mb-32 dark:mt-[-4.5rem] dark:pb-32 dark:pt-[4.5rem] dark:lg:mt-[-4.75rem] dark:lg:pt-[4.75rem]">
      <div className="py-16 sm:px-2 lg:relative lg:py-40 lg:px-0">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-16 px-4">
          <div className="relative md:text-center lg:text-left">
            <div className="relative">
              <div className="max-w-2xl">
                <h1 className="inline bg-gradient-to-r from-primary via-sky-100 to-primary bg-clip-text text-5xl leading-tight tracking-tight text-transparent">
                  <span className="font-semibold">
                    Internationalization for Next.js
                  </span>{' '}
                  <span className="font-light">that gets out of your way.</span>
                </h1>
              </div>
              <p className="mt-3 max-w-xl text-2xl leading-normal tracking-tight text-sky-100/70">
                Support multiple languages, with your code becoming simpler
                instead of more complex.
              </p>
              <div className="mt-12 flex gap-4 md:justify-center lg:justify-start">
                <LinkButton href="/docs">Get started</LinkButton>
                <LinkButton
                  variant="secondary"
                  href="https://github.com/amannn/next-intl"
                  target="_blank"
                >
                  View on GitHub
                </LinkButton>
              </div>
            </div>
          </div>
          <div className="relative -mr-16 max-w-[44rem] lg:static">
            <div className="absolute inset-x-[-50vw] -top-32 -bottom-48 [mask-image:linear-gradient(transparent,white,white)] dark:[mask-image:linear-gradient(transparent,white,transparent)] lg:left-[calc(50%+14rem)] lg:right-0 lg:-top-32 lg:-bottom-32 lg:[mask-image:none] lg:dark:[mask-image:linear-gradient(white,white,transparent)]">
              TODO: SVG
            </div>
            <HeroCode />
          </div>
        </div>
      </div>
    </div>
  );
}
