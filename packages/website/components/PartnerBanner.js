import Partner from './Partner';
import Wrapper from './Wrapper';

export default function PartnerBanner({intro}) {
  return (
    <div className="border-b bg-white py-6 dark:border-b-0 dark:bg-slate-900">
      <Wrapper className="flex flex-col justify-center">
        <p className="text-center text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300">
          {intro}
        </p>
        <a
          className="mx-auto mt-6 inline-flex flex-col items-center gap-2"
          href={Partner.link}
          rel="noreferrer"
          target="_blank"
        >
          <Partner.Logo />
          <p className="text-slate-900 dark:text-white">{Partner.slogan}</p>
        </a>
      </Wrapper>
    </div>
  );
}
