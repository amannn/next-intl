import React, {ReactNode, useState} from 'react';
import IntlConfig from '../core/IntlConfig';
import IntlContext from './IntlContext';
import getInitializedConfig from './getInitializedConfig';

type Props = IntlConfig & {
  children: ReactNode;
};

export default function IntlProvider({children, ...props}: Props) {
  const [messageFormatCache] = useState(() => new Map());

  return (
    <IntlContext.Provider
      value={{
        ...getInitializedConfig(props),
        messageFormatCache
      }}
    >
      {children}
    </IntlContext.Provider>
  );
}
