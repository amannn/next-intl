'use client';

import useCookieSync from '../shared/useCookieSync';

type Props = {
  locale: string;
};

export default function SyncLocaleCookie({locale}: Props) {
  useCookieSync(locale);
  return null;
}
