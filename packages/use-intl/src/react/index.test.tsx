import {render, screen} from '@testing-library/react';
import {parseISO} from 'date-fns';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Locale} from '../core.tsx';
import IntlProvider from './IntlProvider.tsx';
import useFormatter from './useFormatter.tsx';
import useNow from './useNow.tsx';
import useTranslations from './useTranslations.tsx';

describe('performance', () => {
  beforeEach(() => {
    vi.spyOn(Intl, 'DateTimeFormat');
  });

  function Component() {
    const t = useTranslations();
    const format = useFormatter();
    const now = useNow();

    return (
      <>
        <p>{t('message', {date: now})}</p>
        <p>{format.dateTime(parseISO('2020-11-20T10:36:01.516Z'))}</p>
      </>
    );
  }

  function App({locale}: {locale: Locale}) {
    return (
      <IntlProvider
        locale={locale}
        messages={{message: '{date, date}'}}
        timeZone="Europe/Berlin"
      >
        <Component />
      </IntlProvider>
    );
  }

  it('caches `Intl` constructors across `useTranslations` and `useFormatter`', () => {
    render(<App locale="en" />);
    screen.getByText('11/20/2020');
    expect(Intl.DateTimeFormat).toHaveBeenCalledTimes(1);
  });

  it('releases the cache from memory when the locale changes', () => {
    const {rerender} = render(<App locale="en" />);
    rerender(<App locale="de" />);
    rerender(<App locale="en" />);
    expect(Intl.DateTimeFormat).toHaveBeenCalledTimes(3);
  });
});
