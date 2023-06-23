// @ts-ignore

import {render} from '@testing-library/react';
import pick from 'lodash/pick';
import {NextIntlClientProvider} from 'next-intl';
import messages from '../../messages/en.json';
import Navigation from './Navigation';

// If the tested component uses features from Next.js, you have to mock them.
// Note that next-intl only has an optional dependency on Next.js.
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      locale: 'en',
      locales: ['en', 'de']
    };
  }
}));

it('renders', () => {
  render(
    <NextIntlClientProvider
      locale="en"
      messages={pick(messages, Navigation.messages)}
    >
      <Navigation />
    </NextIntlClientProvider>
  );
});
