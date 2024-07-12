import {createContext} from 'react';
import type {InitializedIntlConfig} from '../core/IntlConfig';
import type {Formatters} from '../core/formatters';

export type IntlContextValue = InitializedIntlConfig & {
  formatters: Formatters;
};

const IntlContext = createContext<IntlContextValue | undefined>(undefined);

export default IntlContext;
