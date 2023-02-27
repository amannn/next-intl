export default function FeaturePanel({code, description, title}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
      {code && (
        <div className="grow bg-slate-900">
          <pre className="dark -ml-4 overflow-x-auto !p-4 md:!p-8">{code}</pre>
        </div>
      )}
      <div className="p-4 md:p-8">
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
