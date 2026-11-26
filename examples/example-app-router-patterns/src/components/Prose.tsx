import clsx from 'clsx';
import type {ReactNode} from 'react';

export default function Prose({children}: {children: ReactNode}) {
  return (
    <div
      className={clsx(
        'text-[0.95rem] leading-[1.65] text-gray-900 dark:text-gray-50',
        '[&>*+*]:mt-4',
        '[&>p]:text-gray-600 dark:[&>p]:text-gray-300',
        '[&_:not(pre)>code]:rounded [&_:not(pre)>code]:border [&_:not(pre)>code]:border-gray-200 [&_:not(pre)>code]:bg-gray-100 [&_:not(pre)>code]:px-[0.35em] [&_:not(pre)>code]:py-[0.1em] [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em] dark:[&_:not(pre)>code]:border-gray-700 dark:[&_:not(pre)>code]:bg-gray-800',
        '[&_a_code]:text-blue-700 [&_a:hover_code]:underline dark:[&_a_code]:text-blue-300',
        '[&>h3]:mt-5 [&>h3]:text-base [&>h3]:font-semibold [&>h3]:text-gray-900 dark:[&>h3]:text-gray-50'
      )}
    >
      {children}
    </div>
  );
}
