import {parseISO} from 'date-fns';
import {createIntl} from '../../src';

const intl = createIntl({locale: 'en'});

it('formats a date and time', () => {
  expect(
    intl.formatDateTime(parseISO('2020-11-20T10:36:01.516Z'), {
      dateStyle: 'medium'
    })
  ).toBe('Nov 20, 2020');
});

it('formats a number', () => {
  expect(
    intl.formatNumber(123456.789, {style: 'currency', currency: 'USD'})
  ).toBe('$123,456.79');
});

it('formats a relative time', () => {
  expect(
    intl.formatRelativeTime(
      parseISO('2020-11-20T10:36:01.516Z'),
      parseISO('2020-11-20T12:30:01.516Z')
    )
  ).toBe('2 hours ago');
});
