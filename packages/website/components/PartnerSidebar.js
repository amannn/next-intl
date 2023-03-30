import Partner from './Partner';
import PartnerLink from './PartnerLink';

export default function PartnerSidebar({intro = 'Presented by'}) {
  return (
    <div className="pb-[0.35rem]">
      <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {intro}
      </p>
      <PartnerLink href={Partner.link}>
        <Partner.Logo height={20} />
      </PartnerLink>
    </div>
  );
}
