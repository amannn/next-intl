import Partner from './Partner';
import PartnerLink from './PartnerLink';
import Wrapper from './Wrapper';

type Props = {
  intro: string;
};

export default function PartnerBanner({intro}: Props) {
  return (
    <div className="border-b bg-white py-6 dark:border-b-0 dark:bg-slate-900">
      <Wrapper className="flex flex-col justify-center">
        <p className="text-center text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {intro}
        </p>
        <PartnerLink
          className="mx-auto mt-6 inline-flex flex-col items-center gap-4"
          href={Partner.link}
          name="partner-banner"
        >
          <Partner.Logo />
          <p className="text-slate-700 dark:text-slate-400">{Partner.slogan}</p>
        </PartnerLink>
      </Wrapper>
    </div>
  );
}
