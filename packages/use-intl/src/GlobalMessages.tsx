// This module is intended to be overridden
// by the consumer for optional type safety

// type Messages = typeof import('./en.json');

// eslint-disable-next-line @typescript-eslint/ban-types
type Unknown = {};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GlobalMessages
  // Messages,
  extends Unknown {}

export default GlobalMessages;
