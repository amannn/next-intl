import {createContext} from 'react';
import IntlContextValue from './IntlContextValue';

const IntlContext = createContext<IntlContextValue | undefined>(undefined);

export default IntlContext;
