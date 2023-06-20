import {parseISO} from 'date-fns';
import {createFormatter} from '../../src';

const formatter = createFormatter({locale: 'en'});

it('formats a date and time', () => {
  expect(
    formatter.dateTime(parseISO('2020-11-20T10:36:01.516Z'), {
      dateStyle: 'medium'
    })
  ).toBe('Nov 20, 2020');
});

it('formats a number', () => {
  expect(formatter.number(123456)).toBe('123,456');
});

it('formats a bigint', () => {
  expect(formatter.number(123456789123456789n)).toBe('123,456,789,123,456,789');
});

it('formats a number as currency', () => {
  expect(
    formatter.number(123456.789, {style: 'currency', currency: 'USD'})
  ).toBe('$123,456.79');
});

it('formats a bigint as currency', () => {
  expect(
    formatter.number(123456789123456789n, {style: 'currency', currency: 'USD'})
  ).toBe('$123,456,789,123,456,789.00');
});

it('formats a relative time', () => {
  expect(
    formatter.relativeTime(
      parseISO('2020-11-20T10:36:01.516Z'),
      parseISO('2020-11-20T12:30:01.516Z')
    )
  ).toBe('2 hours ago');
});

it('formats a list', () => {
  expect(
    formatter.list(['apple', 'banana', 'orange'], {type: 'disjunction'})
  ).toBe('apple, banana, or orange');
});

it('formats a set', () => {
  expect(
    formatter.list(new Set(['apple', 'banana', 'orange']), {
      type: 'disjunction'
    })
  ).toBe('apple, banana, or orange');
});
