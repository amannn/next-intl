import {createContext} from 'react';
import type {InitializedIntlConfig} from '../core/IntlConfig.js';
import type TimeZone from '../core/TimeZone.js';
import type {Formatters, IntlCache} from '../core/formatters.js';

export type IntlContextValue = Omit<InitializedIntlConfig, 'timeZone'> & {
  formatters: Formatters;
  cache: IntlCache;
  timeZone?: TimeZone;
};

const IntlContext = createContext<IntlContextValue | undefined>(undefined);

export default IntlContext;
