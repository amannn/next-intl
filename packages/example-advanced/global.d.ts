// How to name this file? Check next.js docs
// https://emotion.sh/docs/typescript#define-a-theme

// import {GlobalMessages as GM} from 'next-intl';

// declare module 'next-intl' {
//   type Messages = typeof import('./messages/en.json');

//   // eslint-disable-next-line @typescript-eslint/no-empty-interface
//   export interface GlobalMessages extends Messages {}
// }

// declare global {
//   type Messages = typeof import('./messages/en.json');

//   // eslint-disable-next-line @typescript-eslint/no-empty-interface
//   export interface GlobalMessages extends Messages {}

//   // type Foo = Omit<GlobalMessages, ''>;

//   export interface Jan {
//     hello: string;
//   }
// }

declare interface GlobalJan {
  hello: string;
}

type Messages = typeof import('./messages/en.json');

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface GlobalMessages extends Messages {}
