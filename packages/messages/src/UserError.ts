// An error caused by the project's setup, which consumers present to the user
// in their own voice (e.g. with a `[next-intl]` prefix)
export default class UserError extends Error {
  /** How to fix the setup, for consumers that show it apart from the message. */
  public hint?: string;

  public constructor(message: string, options?: {hint?: string}) {
    super(message);
    this.hint = options?.hint;
  }
}
