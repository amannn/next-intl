import {expect, it} from 'vitest';
import {NextIntlClientProvider} from 'next-intl';
import Counter from './Counter';
import {renderToString} from 'react-dom/server';

it('renders', () => {
  expect(
    renderToString(
      <NextIntlClientProvider locale="en" timeZone="UTC">
        <Counter />
      </NextIntlClientProvider>
    )
  ).toMatchInlineSnapshot(`"<p>Count: 1,000</p><button>Increment</button>"`);
});
