import Partner from './Partner';

export default function PartnerSidebar({intro = 'Presented by'}) {
  return (
    <div className="pb-1">
      <p className="mb-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300">
        {intro}
      </p>
      {/* eslint-disable-next-line react/jsx-no-target-blank */}
      <a href={Partner.link} target="_blank">
        <Partner.Logo height={20} />
      </a>
    </div>
  );
}
