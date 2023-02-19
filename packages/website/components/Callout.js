import cn from 'clsx';

const TypeToEmoji = {
  default: '💡',
  warning: '⚠️'
};

const classes = {
  default: cn(
    'border-green-700/20 bg-green-50 text-green-800 dark:border-green-400/20 dark:bg-green-600/10 dark:text-green-200'
  ),
  warning: cn(
    'border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-200/20 dark:bg-yellow-700/20 dark:text-yellow-200'
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
