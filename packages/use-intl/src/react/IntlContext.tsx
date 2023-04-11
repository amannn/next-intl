import {createContext} from 'react';
import {InitializedIntlConfig} from '../core/IntlConfig';

const IntlContext = createContext<InitializedIntlConfig | undefined>(undefined);

export default IntlContext;
