/** A generic type that describes the shape of messages.
 *
 * Optionally `IntlMessages` can be provided to get type safety for message
 * namespaces and keys. See https://next-intl.dev/docs/usage/typescript
 */
type AbstractIntlMessages = {
  [id: string]: AbstractIntlMessages | string;
};

export default AbstractIntlMessages;
