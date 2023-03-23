import clsx from 'clsx';

export default function Wrapper({children, className}) {
  return (
    <div className={clsx(className, 'relative mx-auto max-w-[95rem] px-4')}>
      {children}
    </div>
  );
}
