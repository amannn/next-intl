'use client';

import {useMessages} from 'next-intl';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  debug?: boolean;
};

export default function ClientBoundary({children, debug = true}: Props) {
  const messages = useMessages();
  return (
    <div className="border border-green-300">
      {debug && (
        <pre data-id="provider-client-messages" className="bg-green-100 p-2">
          {JSON.stringify(messages, null, 2)}
        </pre>
      )}
      <div className="p-2">{children}</div>
    </div>
  );
}
