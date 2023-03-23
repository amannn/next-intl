import Partner from './Partner';

export default function PartnerSidebar({intro = 'Presented by'}) {
  return (
    <div className="pb-1">
      <p className="mb-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300">
        {intro}
      </p>
      <Partner.Logo height={20} />
    </div>
  );
}
