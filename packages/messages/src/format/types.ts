import type formats from './index.js';

export type BuiltInMessagesFormat = keyof typeof formats;

type CustomMessagesFormat = {
  codec: string;
  extension: `.${string}`;
};

export type MessagesFormat = BuiltInMessagesFormat | CustomMessagesFormat;
