import cn from 'clsx';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  emoji?: string;
  title?: string;
  type?: 'default' | 'warning';
};

const TypeToEmoji = {
  default: '💡',
  warning: '⚠️',
  question: '🤔'
};

const classes = {
  default: cn(
    'border-green-700/20 bg-green-50 text-green-800 dark:border-green-400/40 dark:bg-green-700/30 dark:text-white/90'
  ),
  warning: cn(
    'border-yellow-700/20 bg-yellow-50 text-yellow-900 dark:border-yellow-400/40 dark:bg-yellow-700/30 dark:text-white/90'
  ),
  question: cn(
    'border-sky-700/20 bg-sky-50 text-sky-800 dark:border-sky-400/40 dark:bg-sky-700/30 dark:text-white/90'
  )
};

export default function Callout({
  children,
  type = 'default',
  title,
  className,
  emoji = TypeToEmoji[type]
}: Props) {
  return (
    <div
      className={cn(
        className,
        'nextra-callout mt-6 flex overflow-x-auto rounded-lg border py-3 ltr:pr-4 rtl:pl-4',
        'contrast-more:border-current contrast-more:dark:border-current',
        classes[type]
      )}
    >
      <div
        className="select-none text-xl ltr:pl-3 ltr:pr-2 rtl:pl-2 rtl:pr-3"
        style={{
          fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
        }}
      >
        {emoji}
      </div>
      <div className="nx-w-full nx-min-w-0 nx-leading-7">
        {title && (
          <p className="mb-1">
            <strong>{title}</strong>
          </p>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
