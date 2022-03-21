import IntlMessages from './IntlMessages';

// Using an interface here allows a consumer
// to override this with a specific type

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GlobalMessages extends IntlMessages {}

export default GlobalMessages;
