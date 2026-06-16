import clsx from 'clsx';
import type {CSSProperties, ReactNode} from 'react';

const dotgridStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(circle at center, rgba(120, 120, 140, 0.3) 1px, transparent 1px)',
  backgroundSize: '14px 14px'
};

export function PlaygroundBoundary({
  children,
  label,
  className,
  innerClassName,
  size = 'default',
  variant = 'plain'
}: {
  children: ReactNode;
  label?: string | Array<string>;
  className?: string;
  innerClassName?: string;
  size?: 'default' | 'compact';
  variant?: 'plain' | 'dotgrid';
}) {
  return (
    <div
      className={clsx(
        'relative border border-gray-200 dark:border-gray-700',
        size === 'default' ? 'p-5 sm:p-8 lg:p-10' : 'p-3',
        className
      )}
      style={variant === 'dotgrid' ? dotgridStyle : undefined}
    >
      {label && (
        <div className="absolute -top-[7px] left-5 flex gap-x-1">
          {(typeof label === 'string' ? [label] : label).map((text) => (
            <span
              key={text}
              className="bg-gray-50 px-1.5 font-mono text-[10px] font-semibold tracking-[0.18em] text-gray-600 uppercase dark:bg-gray-900 dark:text-gray-300"
            >
              {text}
            </span>
          ))}
        </div>
      )}
      <div className={innerClassName}>{children}</div>
    </div>
  );
}
