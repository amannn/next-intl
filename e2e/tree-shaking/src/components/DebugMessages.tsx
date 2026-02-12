'use client';

import {useMessages} from 'next-intl';

export default function DebugMessages() {
  const messages = useMessages();
  return (
    <pre data-id="provider-client-messages" className="bg-green-100 p-2">
      {JSON.stringify(messages, null, 2)}
    </pre>
  );
}
