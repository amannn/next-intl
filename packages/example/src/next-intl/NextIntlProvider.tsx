import 'server-only';
import {createServerContext, ReactNode} from 'react';

// This is always passed to the client, regardless of if it's read from a client component!
// Interestingly the module code is not there, but the context value.
const ServerOnlyContext = createServerContext('serverOnly', 'initialValue');

export default function NextIntlProvider({
  children,
  locale
}: {
  children: ReactNode;
  locale: string;
}) {
  return (
    <ServerOnlyContext.Provider value={{locale}}>
      {children}
    </ServerOnlyContext.Provider>
  );
}
