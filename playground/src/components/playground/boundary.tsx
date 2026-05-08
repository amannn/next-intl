import clsx from 'clsx';
import type React from 'react';

export const PlaygroundBoundary = ({
  children,
  label,
  className,
  innerClassName,
  size = 'default',
}: {
  children: React.ReactNode;
  label?: string | string[];
  className?: string;
  innerClassName?: string;
  size?: 'default' | 'compact';
}) => {
  return (
    <div
      className={clsx(
        'relative border border-border text-muted-foreground',
        size === 'default' ? 'p-6 sm:p-8' : 'p-4',
        className,
      )}
    >
      {label && (
        <div className="absolute -top-[7px] left-4 flex gap-x-1">
          {(typeof label === 'string' ? [label] : label).map((text) => (
            <span
              key={text}
              className="px-1.5 font-mono text-[10px] font-medium tracking-[0.18em] uppercase bg-background text-muted-foreground"
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
