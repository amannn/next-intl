import React, {ReactNode} from 'react';
import {setRequestCacheLocale} from './RequestLocale';

type Props = {
  locale: string;
  children: ReactNode;
};

export default function NextIntlServerProvider({children, locale}: Props) {
  setRequestCacheLocale(locale);
  return <>{children}</>;
}
