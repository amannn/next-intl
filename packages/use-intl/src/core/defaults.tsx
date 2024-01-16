import IntlError from './IntlError';
import joinPath from './joinPath';

/**
 * Contains defaults that are used for all entry points into the core.
 * See also `InitializedIntlConfiguration`.
 */

export function defaultGetMessageFallback(props: {
  error: IntlError;
  key: string;
  namespace?: string;
}) {
  return joinPath(props.namespace, props.key);
}

export function defaultOnError(error: IntlError) {
  console.error(error);
}
