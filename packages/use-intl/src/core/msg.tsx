export type ExtractedMessage<Message extends string = string> = string & {
  readonly __extractedMessage: Message;
};

type MessageParams<Message extends string> = {
  id?: string;
  /** Inline ICU message in the source locale. */
  message: Message;
  /** Description for translators and tooling. */
  description?: string;
  /** Optional catalog namespace. Resolve with root `useExtracted()` / `getExtracted()`. */
  namespace?: string;
};

function msg<Message extends string>(
  /** Inline ICU message in the source locale. */
  message: Message
): ExtractedMessage<Message>;
function msg<Message extends string>(
  params: MessageParams<Message>
): ExtractedMessage<Message>;
function msg<Message extends string>(
  messageOrParams: Message | MessageParams<Message>
): ExtractedMessage<Message> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[next-intl] `msg` was called in production without compilation. Include modules that call `msg` in `srcPath` and use `transpilePackages` for 3rd-party packages.'
    );
  }

  const message =
    typeof messageOrParams === 'string'
      ? messageOrParams
      : messageOrParams.message;

  return message as unknown as ExtractedMessage<Message>;
}

const defineMessage = msg;

export {defineMessage};
export default msg;
