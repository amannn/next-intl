import { parseISO } from 'date-fns';
import { it, expect } from 'vitest';
import { createFormatter } from '../../src';

it('formats a date and time', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.dateTime(parseISO('2020-11-20T10:36:01.516Z'), {
      dateStyle: 'medium',
    })
  ).toBe('Nov 20, 2020');
});

it('formats a ISO 8601 datetime string', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.dateTime('2020-11-20T10:36:01.516Z', {
      dateStyle: 'medium',
    })
  ).toBe('Nov 20, 2020');
});

it('formats a number', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(formatter.number(123456)).toBe('123,456');
});

it('formats a bigint', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(formatter.number(123456789123456789n)).toBe('123,456,789,123,456,789');
});

it('formats a number as currency', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.number(123456.789, { style: 'currency', currency: 'USD' })
  ).toBe('$123,456.79');
});

it('formats a bigint as currency', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.number(123456789123456789n, {
      style: 'currency',
      currency: 'USD',
    })
  ).toBe('$123,456,789,123,456,789.00');
});

it('formats a relative time with the second unit', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.relativeTime(
      parseISO('2020-11-20T00:00:00.000Z'),
      parseISO('2020-11-20T00:00:10.000Z')
    )
  ).toBe('10 seconds ago');
});

it('formats a relative time with the minute unit', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.relativeTime(
      parseISO('2020-11-20T00:00:00.000Z'),
      parseISO('2020-11-20T00:01:10.000Z')
    )
  ).toBe('1 minute ago');
});

it('formats a relative time with the hour unit', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.relativeTime(
      parseISO('2020-11-20T10:36:01.516Z'),
      parseISO('2020-11-20T12:30:01.516Z')
    )
  ).toBe('2 hours ago');
});

it('formats a relative time with the day unit', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.relativeTime(
      parseISO('2020-11-20T00:00:00.000Z'),
      parseISO('2020-11-22T00:10:00.000Z')
    )
  ).toBe('2 days ago');
});

it('formats a relative time with the month unit', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.relativeTime(
      parseISO('2022-12-01T00:00:00.000Z'),
      parseISO('2023-01-01T00:00:00.000Z')
    )
  ).toBe('last month');
});

it('formats a relative time with the year unit', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.relativeTime(
      parseISO('2022-01-01T00:00:00.000Z'),
      parseISO('2024-01-01T00:00:00.000Z')
    )
  ).toBe('2 years ago');
});

it('supports the future relative time', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.relativeTime(
      parseISO('2023-01-01T00:00:00.000Z'),
      parseISO('2022-01-01T00:00:00.000Z')
    )
  ).toBe('next year');
});

it('formats a relative time with options', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.relativeTime(parseISO('2020-11-20T08:30:00.000Z'), {
      now: parseISO('2020-11-20T10:36:00.000Z'),
      unit: 'day',
    })
  ).toBe('today');
});

it('supports the quarter unit', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.relativeTime(parseISO('2020-01-01T00:00:00.000Z'), {
      now: parseISO('2020-11-01T01:00:00.000Z'),
      unit: 'quarter',
    })
  ).toBe('3 quarters ago');
});

it('formats a relative time with a globally defined `now`', () => {
  const formatter = createFormatter({
    locale: 'en',
    now: parseISO('2020-11-20T01:00:00.000Z'),
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.relativeTime(parseISO('2020-11-20T00:00:00.000Z'), {
      unit: 'day',
    })
  ).toBe('today');
});

it('formats a list', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.list(['apple', 'banana', 'orange'], { type: 'disjunction' })
  ).toBe('apple, banana, or orange');
});

it('formats a set', () => {
  const formatter = createFormatter({
    locale: 'en',
    timeZone: 'Europe/Berlin',
  });
  expect(
    formatter.list(new Set(['apple', 'banana', 'orange']), {
      type: 'disjunction',
    })
  ).toBe('apple, banana, or orange');
});
