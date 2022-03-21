// This module is intended to be overridden
// by the consumer for optional type safety

// eslint-disable-next-line @typescript-eslint/ban-types
type Unknown = {};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GlobalMessages extends Unknown {}

export default GlobalMessages;
