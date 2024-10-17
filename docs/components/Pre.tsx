import cn from 'clsx';
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
        className={cn(
          'nextra-focus',
          'overflow-x-auto subpixel-antialiased [&>code]:!text-[.81em] py-4',
          className
        )}
        {...rest}
      >
        {children}
      </pre>
      <div
        className={cn(
          'opacity-0 transition [div:hover>&]:opacity-100 focus-within:opacity-100',
          'flex gap-1 absolute right-[0.7rem]',
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
