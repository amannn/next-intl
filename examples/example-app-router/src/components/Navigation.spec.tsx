import {render} from '@testing-library/react';
import pick from 'lodash/pick';
import {NextIntlClientProvider} from 'next-intl';
import messages from '../../messages/en.json';
import Navigation from './Navigation';

// If the tested component uses features from Next.js, you have to mock them.
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    push: jest.fn(),
    prefetch: jest.fn(),
    replace: jest.fn()
  }),
  useParams: () => ({locale: 'en'}),
  useSelectedLayoutSegment: () => ({locale: 'en'})
}));

it('renders', () => {
  render(
    <NextIntlClientProvider
      locale="en"
      messages={pick(messages, ['Navigation', 'LocaleSwitcher'])}
    >
      <Navigation />
    </NextIntlClientProvider>
  );
});
