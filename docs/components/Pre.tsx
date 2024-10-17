import clsx from 'clsx';
import type {ComponentProps, FC, ReactElement} from 'react';
import {useRef} from 'react';
import CopyToClipboard from './CopyToClipboard';

export default function Pre({
  children,
  className,
  'data-copy': copy,
  'data-filename': filename,
  ...props
}: ComponentProps<'pre'> & {
  'data-filename'?: string;
  'data-copy'?: '';
  'data-language'?: string;
  'data-word-wrap'?: '';
  icon?: FC<ComponentProps<'svg'>>;
}): ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {icon, ...rest} = props;
  const preRef = useRef<HTMLPreElement>(null);

  return (
    <div className="nextra-code relative overflow-hidden rounded-md bg-primary-700/5 dark:bg-primary-300/10 [&:not(:first-child)]:mt-6">
      {filename && (
        <div className="bg-primary-700/5 px-4 py-3 text-xs text-gray-700 dark:bg-primary-300/10 dark:text-gray-200">
          <span className="truncate">{filename}</span>
        </div>
      )}
      <pre
        ref={preRef}
        className={clsx(
          'nextra-focus',
          'overflow-x-auto py-4 subpixel-antialiased [&>code]:!text-[.81em]',
          className
        )}
        {...rest}
      >
        {children}
      </pre>
      <div
        className={clsx(
          'opacity-0 transition focus-within:opacity-100 [div:hover>&]:opacity-100',
          'absolute right-[0.7rem] flex gap-1',
          filename ? 'top-[3.2rem]' : 'top-[0.7rem]'
        )}
      >
        {copy === '' && (
          <CopyToClipboard
            className={filename ? 'ml-auto' : ''}
            getValue={() =>
              preRef.current?.querySelector('code')?.textContent || ''
            }
          />
        )}
      </div>
    </div>
  );
}
