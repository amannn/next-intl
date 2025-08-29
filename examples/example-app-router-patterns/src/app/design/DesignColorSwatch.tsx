import clsx from 'clsx';

type Props = {
  className: string;
  value: string;
};

export default function DesignColorSwatch({className, value}: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={clsx(className, 'size-20')} />
      <div className="text-sm">{value}</div>
    </div>
  );
}
