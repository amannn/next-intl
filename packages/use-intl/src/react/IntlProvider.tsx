import React, {ReactNode, useState} from 'react';
import IntlConfig from '../core/IntlConfig';
import initializeConfig from '../core/initializeConfig';
import IntlContext from './IntlContext';

type Props = IntlConfig & {
  children: ReactNode;
};

export default function IntlProvider({children, ...config}: Props) {
  const [messageFormatCache] = useState(() => new Map());

  return (
    <IntlContext.Provider
      value={{
        ...initializeConfig(config),
        messageFormatCache
      }}
    >
      {children}
    </IntlContext.Provider>
  );
}
