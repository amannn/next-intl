export default function FeaturePanel({description, icon, title}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-600 dark:bg-slate-800">
      {icon && <div className="mb-6">{icon}</div>}
      <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
