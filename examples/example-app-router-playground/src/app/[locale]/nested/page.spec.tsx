import {render, screen} from '@testing-library/react';
import pick from 'lodash/pick';
import {NextIntlClientProvider} from 'next-intl';
import messages from '../../../../messages/en.json';
import Nested, {generateMetadata} from './page';

it('renders', () => {
  render(
    <NextIntlClientProvider locale="en" messages={pick(messages, ['Nested'])}>
      <Nested />
    </NextIntlClientProvider>
  );
  screen.getByText('Nested');
});

it("can't generate metadata in a test", async () => {
  await expect(generateMetadata()).rejects.toThrow(
    '`getTranslations` is not supported in Client Components.'
  );
});
