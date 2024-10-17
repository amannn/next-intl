import {ComponentProps} from 'react';

type Props = ComponentProps<'svg'>;

export default function CopyIcon(props: Props) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect height={13} rx={2} width={13} x={9} y={9} />
      <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" />
    </svg>
  );
}
