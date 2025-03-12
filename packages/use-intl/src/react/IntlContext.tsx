import {createContext} from 'react';
import type {InitializedIntlConfig} from '../core/IntlConfig.js';
import type {Formatters, IntlCache} from '../core/formatters.js';

export type IntlContextValue = InitializedIntlConfig & {
  formatters: Formatters;
  cache: IntlCache;
};

const IntlContext = createContext<IntlContextValue | undefined>(undefined);

export default IntlContext;
