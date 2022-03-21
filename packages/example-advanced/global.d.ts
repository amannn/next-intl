// How to name this file? Check next.js docs
// https://emotion.sh/docs/typescript#define-a-theme

import 'next-intl';

declare module 'next-intl' {
  type Messages = typeof import('./messages/en.json');

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface GlobalMessages extends Messages {}
}
