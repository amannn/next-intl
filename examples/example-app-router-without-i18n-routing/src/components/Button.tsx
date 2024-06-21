import {ComponentProps} from 'react';

export default function Button(props: ComponentProps<'button'>) {
  return (
    <button
      className="block w-full rounded-sm border border-slate-900 bg-slate-900 px-3 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
      type="button"
      {...props}
    />
  );
}
