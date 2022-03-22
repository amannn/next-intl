// This module is intended to be overridden
// by the consumer for optional type safety

type Messages = typeof import('./en.json');

// eslint-disable-next-line @typescript-eslint/ban-types
type Unknown = {};

// declare global {
// eslint-disable-next-line @typescript-eslint/no-empty-interface
// interface GlobalMessages extends Unknown {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
// eslint-disable-next-line @typescript-eslint/no-empty-interface
// interface GlobalMessages extends Unknown {}
// }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface GlobalMessages extends Messages {}

// export default GlobalMessages;
