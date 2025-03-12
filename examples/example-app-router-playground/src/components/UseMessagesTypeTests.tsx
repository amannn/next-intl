/* eslint-disable @typescript-eslint/no-unused-expressions */
import {useMessages} from 'next-intl';
import {getMessages} from 'next-intl/server';

export async function AsyncComponent() {
  const messages = await getMessages();

  // Valid
  messages.Index;
  messages.Index.title;

  // Invalid
  // @ts-expect-error
  messages.Unknown;
  // @ts-expect-error
  messages.Index.unknown;
}

export function RegularComponent() {
  const messages = useMessages();

  // Valid
  messages.Index;
  messages.Index.title;

  // Invalid
  // @ts-expect-error
  messages.Unknown;
  // @ts-expect-error
  messages.Index.unknown;
}
