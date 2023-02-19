import cn from 'clsx';
import {InformationCircleIcon} from 'nextra/icons';

const TypeToEmoji = {
  default: '💡',
  error: '🚫',
  info: <InformationCircleIcon className="nx-mt-1" />,
  warning: '⚠️'
};

const classes = {
  default: cn(
    'border-green-700/20 bg-green-50 text-green-800 dark:border-green-400/30 dark:bg-green-400/20 dark:text-green-300'
  ),
  error: cn(
    'nx-border-red-200 nx-bg-red-100 nx-text-red-900 dark:nx-border-red-200/30 dark:nx-bg-red-900/30 dark:nx-text-red-200'
  ),
  info: cn(
    'nx-border-blue-200 nx-bg-blue-100 nx-text-blue-900 dark:nx-border-blue-200/30 dark:nx-bg-blue-900/30 dark:nx-text-blue-200'
  ),
  warning: cn(
    'nx-border-yellow-300 nx-bg-yellow-50 nx-text-yellow-900 dark:nx-border-yellow-200/30 dark:nx-bg-yellow-700/30 dark:nx-text-yellow-200'
  )
};

export default function Callout({
  children,
  type = 'default',
  emoji = TypeToEmoji[type]
}) {
  return (
    <div
      className={cn(
        'nextra-callout overflow-x-auto mt-6 flex rounded-lg border py-3 ltr:pr-4 rtl:pl-4',
        'contrast-more:border-current contrast-more:dark:border-current',
        classes[type]
      )}
    >
      <div
        className="select-none text-xl ltr:pl-3 ltr:pr-2 rtl:pr-3 rtl:pl-2"
        style={{
          fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
        }}
      >
        {emoji}
      </div>
      <div className="nx-w-full nx-min-w-0 nx-leading-7">{children}</div>
    </div>
  );
}
