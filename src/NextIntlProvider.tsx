import React, {ReactNode} from 'react';
import NextIntlContext from './NextIntlContext';
import NextIntlMessages from './NextIntlMessages';

type Props = {
  children: ReactNode;
  messages: NextIntlMessages;
  /* Override the automatically provided locale from Next.js */
  locale?: string;
};

export default function NextIntlProvider({children, locale, messages}: Props) {
  return (
    <NextIntlContext.Provider value={{messages, locale}}>
      {children}
    </NextIntlContext.Provider>
  );
}
