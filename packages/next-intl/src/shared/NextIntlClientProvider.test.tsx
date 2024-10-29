import {render, screen} from '@testing-library/react';
import {it, vi} from 'vitest';
import {
  NextIntlClientProvider,
  useTranslations
} from '../index.react-client.tsx';

vi.mock('next/navigation.js', () => ({
  useParams() {
    return {locale: 'en'};
  }
}));

function Component() {
  const t = useTranslations();
  return <>{t('message', {price: 29000.5})}</>;
}

function TestProvider({locale}: {locale?: string}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{message: '{price, number, ::currency/EUR}'}}
    >
      <Component />
    </NextIntlClientProvider>
  );
}

it('can use messages from the provider', () => {
  render(<TestProvider locale="en" />);
  screen.getByText('€29,000.50');
});

it('reads a default locale from params', () => {
  render(<TestProvider />);
  screen.getByText('€29,000.50');
});

it('can override the locale from Next.js', () => {
  render(<TestProvider locale="de" />);
  screen.getByText('29.000,50 €');
});
