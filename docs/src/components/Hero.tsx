import HeroAnnouncement from './HeroAnnouncement';
import HeroCode from './HeroCode';
import LinkButton from './LinkButton';
import Wrapper from './Wrapper';

type Props = {
  description: string;
  getStarted: string;
  title: string;
  viewExample: string;
  announcement?: {
    href: string;
    label: string;
  };
};

export default function Hero({
  announcement,
  description,
  getStarted,
  title,
  viewExample
}: Props) {
  return (
    <div className="dark overflow-hidden">
      <div className="relative max-w-full overflow-hidden bg-slate-850 py-16 sm:px-2 lg:px-0 lg:py-40">
        <div className="absolute left-0 top-0 h-[20500px] w-[20500px] translate-x-[-47.5%] rounded-full bg-gradient-to-b from-slate-900 via-cyan-500 md:top-1" />
        <Wrapper>
          <div className="flex flex-col gap-16 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-2xl">
              <h1 className="inline bg-gradient-to-r from-white via-sky-100 to-primary-400 bg-clip-text text-3xl font-semibold leading-tight tracking-tight text-transparent lg:text-5xl">
                {title}
              </h1>

              <p className="mt-3 max-w-xl text-lg leading-normal tracking-tight text-sky-100/70 lg:mt-4 lg:text-2xl lg:leading-normal">
                {description}
              </p>
              <div className="mt-8 flex flex-col gap-4 md:flex-row lg:mt-10">
                <div>
                  <LinkButton href="/docs/getting-started" size="lg">
                    {getStarted}
                  </LinkButton>
                </div>
                <div>
                  <LinkButton
                    href="https://next-intl-example-app-router.vercel.app"
                    size="lg"
                    target="_blank"
                    variant="secondary"
                  >
                    {viewExample}
                  </LinkButton>
                </div>
              </div>
              {announcement && (
                <HeroAnnouncement href={announcement.href}>
                  {announcement.label}
                </HeroAnnouncement>
              )}
            </div>
            <div className="max-w-[44rem] xl:-mr-8 2xl:-mr-24">
              <HeroCode />
            </div>
          </div>
        </Wrapper>
      </div>
    </div>
  );
}
