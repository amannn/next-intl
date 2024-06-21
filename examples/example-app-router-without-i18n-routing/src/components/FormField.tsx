import {ComponentProps} from 'react';

export default function FormField({
  label,
  ...rest
}: {label: string} & ComponentProps<'input'>) {
  return (
    <label>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <input
        className="mt-2 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none transition-colors placeholder:text-slate-500 hover:border-slate-400 focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
        {...rest}
      />
    </label>
  );
}
