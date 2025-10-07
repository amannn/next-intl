import {type ReactNode, Suspense} from 'react';
import type {ReactDOMServerReadableStream} from 'react-dom/server';
import {renderToReadableStream} from 'react-dom/server.browser';

async function readStream(stream: ReactDOMServerReadableStream) {
  const reader = stream.getReader();
  let result = '';
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    result += Buffer.from(value).toString('utf8');
  }
  return result;
}

export async function renderToStream(children: ReactNode) {
  return readStream(
    await renderToReadableStream(<Suspense>{children}</Suspense>)
  );
}
