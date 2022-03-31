// Declaring this interface provides type safety for message keys
type Messages = typeof import('./messages/en.json');
declare interface IntlMessages extends Messages {}
