export default function FeaturePanel({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8">
      {icon && <div className="mb-6">{icon}</div>}
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  );
}
