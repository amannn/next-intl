import clsx from 'clsx';
import type {ReactNode} from 'react';

export function Prose({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'text-[0.95rem] leading-[1.65] text-gray-900 dark:text-gray-50',
        '[&>*+*]:mt-4',
        '[&_p]:text-gray-600 dark:[&_p]:text-gray-300',
        '[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5',
        '[&_li]:text-gray-600 dark:[&_li]:text-gray-300 [&_li::marker]:text-gray-600 dark:[&_li::marker]:text-gray-300',
        '[&_:not(pre)>code]:rounded [&_:not(pre)>code]:border [&_:not(pre)>code]:border-gray-200 [&_:not(pre)>code]:bg-gray-100 [&_:not(pre)>code]:px-[0.35em] [&_:not(pre)>code]:py-[0.1em] [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em] dark:[&_:not(pre)>code]:border-gray-700 dark:[&_:not(pre)>code]:bg-gray-800',
        '[&_a]:text-blue-700 [&_a]:underline [&_a]:decoration-dotted [&_a]:underline-offset-[3px] hover:[&_a]:decoration-solid dark:[&_a]:text-blue-300',
        '[&_h2]:mt-7 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_h2]:text-gray-900 dark:[&_h2]:text-gray-50',
        '[&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 dark:[&_h3]:text-gray-50',
        className
      )}
    >
      {children}
    </div>
  );
}
