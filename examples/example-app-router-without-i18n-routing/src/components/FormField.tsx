'use client';

import {ComponentProps} from 'react';
import {useFormStatus} from 'react-dom';

export default function FormField({
  label,
  ...rest
}: {label: string} & ComponentProps<'input'>) {
  const {pending} = useFormStatus();

  return (
    <label>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <input
        className="mt-2 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none transition-all placeholder:text-slate-500 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 hover:enabled:border-slate-400 disabled:opacity-60"
        disabled={pending}
        {...rest}
      />
    </label>
  );
}
