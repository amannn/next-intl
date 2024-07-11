import {createContext} from 'react';
import {InitializedIntlConfig} from '../core/IntlConfig';
import {Formatters} from '../core/formatters';

export type IntlContextValue = InitializedIntlConfig & {
  formatters: Formatters;
};

const IntlContext = createContext<IntlContextValue | undefined>(undefined);

export default IntlContext;
