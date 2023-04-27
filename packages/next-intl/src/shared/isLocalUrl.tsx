import NextLink from 'next/link';
import {ComponentProps} from 'react';

type Url = ComponentProps<typeof NextLink>['href'];

export default function isLocalUrl(url: Url) {
  if (typeof url === 'object') {
    return url.host == null && url.hostname == null;
  } else {
    const hasProtocol = /^[a-z]+:/i.test(url);
    return !hasProtocol;
  }
}
