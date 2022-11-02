import 'server-only';
import {createServerContext} from 'react';

// This is always passed to the client, regardless of if it's read from a client component!
// Interestingly the module code is not there, but the context value.
const ServerOnlyContext = createServerContext('serverOnly', 'initialValue');

export default ServerOnlyContext;
