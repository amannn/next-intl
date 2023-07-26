import React, {ReactNode} from 'react';
import IntlConfig from '../core/IntlConfig';
import initializeConfig from '../core/initializeConfig';
import IntlContext from './IntlContext';

type Props = IntlConfig & {
  children: ReactNode;
};

export default function IntlProvider({children, ...config}: Props) {
  return (
    <IntlContext.Provider value={initializeConfig(config)}>
      {children}
    </IntlContext.Provider>
  );
}
