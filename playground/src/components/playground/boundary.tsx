import clsx from 'clsx';
import type React from 'react';

export const PlaygroundBoundary = ({
  children,
  label,
  className,
  innerClassName,
  size = 'default',
  variant = 'plain'
}: {
  children: React.ReactNode;
  label?: string | string[];
  className?: string;
  innerClassName?: string;
  size?: 'default' | 'compact';
  variant?: 'plain' | 'dotgrid';
}) => {
  return (
    <div
      className={clsx(
        'relative border border-border',
        variant === 'dotgrid' && 'dotgrid',
        size === 'default' ? 'p-5 sm:p-8 lg:p-10' : 'p-3',
        className
      )}
    >
      {label && (
        <div className="absolute -top-[7px] left-5 flex gap-x-1">
          {(typeof label === 'string' ? [label] : label).map((text) => (
            <span
              key={text}
              className="px-1.5 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase bg-background text-muted-foreground"
            >
              {text}
            </span>
          ))}
        </div>
      )}
      <div className={innerClassName}>{children}</div>
    </div>
  );
};
