import {ChangeEvent} from 'react';

export default function FooterVersionSelector() {
  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const version = event.target.value;
    window.location.href = `https://${version}.next-intl.dev`;
  }

  return (
    <select
      className="inline-flex appearance-none items-center bg-transparent py-3 text-xs text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      defaultValue="v4"
      onChange={onChange}
    >
      <option value="v3">v3</option>
      <option value="v4">v4</option>
    </select>
  );
}
