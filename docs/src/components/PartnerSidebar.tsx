import Partner from './Partner';
import PartnerLink from './PartnerLink';

type Props = {
  intro?: string;
};

export default function PartnerSidebar({intro = 'Presented by'}: Props) {
  return (
    <PartnerLink
      className="pb-[0.35rem]"
      href={Partner.link}
      name="partner-sidebar"
    >
      <p className="mb-2 text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {intro}
      </p>
      <Partner.Logo height={20} />
    </PartnerLink>
  );
}
