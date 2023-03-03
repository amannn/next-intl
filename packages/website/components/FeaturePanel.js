export default function FeaturePanel({code, description, title}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
      {code && (
        <div className="grow bg-white dark:bg-slate-900">
          <pre className="-ml-4 overflow-x-auto !p-4 md:!p-8">{code}</pre>
        </div>
      )}
      <div className="bg-slate-100/50 p-4 dark:bg-slate-800 md:p-8">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
