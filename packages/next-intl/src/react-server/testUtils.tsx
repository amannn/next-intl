import {ReactNode, Suspense} from 'react';
import {ReactDOMServerReadableStream} from 'react-dom/server';
// @ts-expect-error -- Not available in types
import {renderToReadableStream as _renderToReadableStream} from 'react-dom/server.browser';

const renderToReadableStream: typeof import('react-dom/server').renderToReadableStream =
  _renderToReadableStream;

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
