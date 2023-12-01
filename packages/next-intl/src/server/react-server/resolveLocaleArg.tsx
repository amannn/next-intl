import getLocale from './getLocale';

export default function resolveLocaleArg(opts?: {
  locale?: string;
}): Promise<string> {
  if (opts?.locale) {
    return Promise.resolve(opts.locale);
  } else {
    return getLocale();
  }
}
