import IntlError from './IntlError';

export function defaultGetMessageFallback({
  key,
  namespace
}: {
  key: string;
  namespace?: string;
}) {
  return [namespace, key].filter((part) => part != null).join('.');
}

export function defaultOnError(error: IntlError) {
  console.error(error);
}
