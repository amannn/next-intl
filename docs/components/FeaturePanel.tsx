type Props = {
  code?: string;
  description: string;
  title: string;
};

export default function FeaturePanel({code, description, title}: Props) {
  return (
    <div className="-mx-4 flex flex-col overflow-hidden border-slate-200 lg:mx-0">
      {code && (
        <div className="grow rounded-sm bg-white dark:bg-slate-800">
          <pre className="-ml-4 overflow-x-auto !p-4 lg:!p-6">{code}</pre>
        </div>
      )}
      <div className="p-4 lg:p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
