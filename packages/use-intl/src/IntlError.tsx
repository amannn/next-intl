export enum IntlErrorCode {
  MISSING_MESSAGE = 'MISSING_MESSAGE',
  MISSING_FORMAT = 'MISSING_FORMAT',
  INSUFFICIENT_PATH = 'INSUFFICIENT_PATH',
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  INVALID_KEY = 'INVALID_KEY',
  FORMATTING_ERROR = 'FORMATTING_ERROR'
}

export default class IntlError extends Error {
  public readonly code: IntlErrorCode;
  public readonly originalMessage: string | undefined;

  constructor(code: IntlErrorCode, originalMessage?: string) {
    let message: string = code;
    if (originalMessage) {
      message += ': ' + originalMessage;
    }
    super(message);

    this.code = code;
    if (originalMessage) {
      this.originalMessage = originalMessage;
    }
  }
}
