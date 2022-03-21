// import IntlMessages from './IntlMessages';

type Test = {};

type Messages = typeof import('./en.json');

// type Messages = Record<string, unknown>;

// const messages = {
//   About: {
//     title: 'About',
//     lastUpdated:
//       'This example was updated {lastUpdatedRelative} ({lastUpdated, date, short}).',
//     nested: {
//       hello: 'Hello'
//     }
//   }
// };

// type IntlMessagesTest = Messages;
// typeof messages;

// Using an interface here allows a consumer
// to override this with a specific type

// eslint-disable-next-line @typescript-eslint/no-empty-interface
// interface GlobalMessages extends Test {}
interface GlobalMessages extends Messages, Test {}

export default GlobalMessages;
