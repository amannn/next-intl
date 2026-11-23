import {UserError} from '@eloqnt/messages/_internal-codec';
import {formatMessage} from './utils.js';

// The shared packages leave naming the product to us
export default function prefixUserError(error: unknown) {
  if (error instanceof UserError) {
    const message = formatMessage(error.message);
    error.stack = error.stack?.replace(error.message, message);
    error.message = message;
  }
  return error;
}
