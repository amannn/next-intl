import clsx from 'clsx';
import type {CSSProperties, ReactNode} from 'react';

const dotgridStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(circle at center, color-mix(in srgb, var(--color-gray-400) 30%, transparent) 1px, transparent 1px)',
  backgroundSize: '14px 14px'
};

export default function PlaygroundBoundary({
  children,
  label,
  size = 'default',
  variant = 'plain'
}: {
  children: ReactNode;
  label?: string;
  size?: 'default' | 'compact';
  variant?: 'plain' | 'dotgrid';
}) {
  return (
    <div
      className={clsx(
        'relative border border-gray-200 dark:border-gray-700',
        size === 'default' ? 'p-5 sm:p-8 lg:p-10' : 'p-3'
      )}
      style={variant === 'dotgrid' ? dotgridStyle : undefined}
    >
      {label && (
        <span className="absolute -top-[7px] left-5 bg-gray-50 px-1.5 font-mono text-[10px] font-semibold tracking-[0.18em] text-gray-600 uppercase dark:bg-gray-900 dark:text-gray-300">
          {label}
        </span>
      )}
      {variant === 'dotgrid' ? (
        <div
          className={clsx(
            'flex min-h-[140px] flex-col items-center justify-center gap-3',
            '[&_h1]:text-2xl [&_h1]:font-semibold [&_p]:text-2xl [&_p]:font-semibold',
            '[&_input]:w-full [&_input]:max-w-xs [&_input]:rounded-md [&_input]:border [&_input]:border-gray-200 [&_input]:bg-gray-50 [&_input]:px-3 [&_input]:py-2 [&_input]:text-base sm:[&_input]:text-sm dark:[&_input]:border-gray-700 dark:[&_input]:bg-gray-900'
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
