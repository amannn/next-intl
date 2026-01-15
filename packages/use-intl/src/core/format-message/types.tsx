import type {ReactNode} from 'react';
import type Formats from '../Formats.js';
import type TimeZone from '../TimeZone.js';
import type {RichTranslationValues} from '../TranslationValues.js';
import type {Formatters, IntlCache} from '../formatters.js';

type FormatMessageOptions = {
  cache: IntlCache;
  formatters: Formatters;
  globalFormats?: Formats;
  formats?: Formats;
  locale: string;
  timeZone?: TimeZone;
};

export type FormatMessage<Message> = (
  message: Message,
  values: RichTranslationValues | undefined,
  options: FormatMessageOptions
) => ReactNode;
