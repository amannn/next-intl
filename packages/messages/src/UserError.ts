// An error caused by the project's setup, which consumers present to the user
// in their own voice (e.g. with a `[next-intl]` prefix)
export default class UserError extends Error {
  /** Distinguishes setups that need different fixes, for consumers that report a code. */
  public code?: UserErrorCode;

  /** Context below the message, e.g. the file that failed to parse. */
  public details?: UserErrorDetails;

  /** How to fix the setup, for consumers that show it apart from the message. */
  public hint?: string;

  public constructor(
    message: string,
    options?: {code?: UserErrorCode; details?: UserErrorDetails; hint?: string}
  ) {
    super(message);
    this.code = options?.code;
    this.details = options?.details;
    this.hint = options?.hint;
  }
}

export type UserErrorCode =
  'MALFORMED_CATALOG' | 'MESSAGES_DIR_NOT_FOUND' | 'MISSING_SOURCE_CATALOG';

export type UserErrorDetails = string | {heading: string; items: Array<string>};
