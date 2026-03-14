'use client';

import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export default function ClientBoundary({children}: Props) {
  return (
    <div className="border border-green-300">
      <div className="p-2">{children}</div>
    </div>
  );
}
