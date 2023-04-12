import React, {ReactNode} from 'react';
import IntlConfig from '../core/IntlConfig';
import IntlContext from './IntlContext';
import getInitializedConfig from './getInitializedConfig';

type Props = IntlConfig & {
  children: ReactNode;
};

export default function IntlProvider({children, ...props}: Props) {
  return (
    <IntlContext.Provider value={getInitializedConfig(props)}>
      {children}
    </IntlContext.Provider>
  );
}
