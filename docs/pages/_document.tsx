import {Html, Head, Main, NextScript} from 'next/document';
import {SkipNavLink} from 'nextra-theme-docs';
import React from 'react';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <SkipNavLink styled />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
