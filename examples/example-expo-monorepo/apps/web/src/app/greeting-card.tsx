'use client';

import {Greeting} from '@example-monorepo/ui';

export function GreetingCard({name, unreadCount}: {readonly name: string; readonly unreadCount: number}) {
  return (
    <Greeting
      name={name}
      unreadCount={unreadCount}
      Text={({children}) => <p style={{margin: 0, lineHeight: 1.5}}>{children}</p>}
      Strong={({children}) => <strong>{children}</strong>}
    />
  );
}
