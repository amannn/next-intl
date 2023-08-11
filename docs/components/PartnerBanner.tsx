import Partner from './Partner';
import PartnerLink from './PartnerLink';
import Wrapper from './Wrapper';

type Props = {
  intro: string;
};

export default function PartnerBanner({intro}: Props) {
  return (
    <>
      <div className="border-b bg-white dark:border-b-0 dark:bg-slate-900">
        <Wrapper className="flex flex-col justify-center">
          <PartnerLink
            className="mx-auto inline-flex flex-col items-center py-6"
            href={Partner.link}
            name="partner-banner"
          >
            <p className="mb-6 text-center text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {intro}
            </p>
            <Partner.Logo />
            <p className="mt-4 text-slate-700 dark:text-slate-400">
              {Partner.slogan}
            </p>
          </PartnerLink>
        </Wrapper>
      </div>
      <div className="mx-auto h-px w-full bg-gradient-to-r from-sky-300/0 via-sky-300/60 to-sky-300/0 dark:via-sky-300/30" />
    </>
  );
}
