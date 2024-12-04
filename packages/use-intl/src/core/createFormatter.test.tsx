import {parseISO} from 'date-fns';
import {describe, expect, it} from 'vitest';
import createFormatter from './createFormatter.tsx';

describe('dateTime', () => {
  it('formats a date and time', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.dateTime(parseISO('2020-11-20T10:36:01.516Z'), {
        dateStyle: 'medium'
      })
    ).toBe('Nov 20, 2020');
  });

  it('allows to override a time zone', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.dateTime(parseISO('2020-11-20T10:36:01.516Z'), {
        timeStyle: 'medium',
        dateStyle: 'medium',
        timeZone: 'America/New_York'
      })
    ).toBe('Nov 20, 2020, 5:36:01 AM');
  });
});

describe('number', () => {
  it('formats a number', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(formatter.number(123456)).toBe('123,456');
  });

  it('formats a bigint', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(formatter.number(123456789123456789n)).toBe(
      '123,456,789,123,456,789'
    );
  });

  it('formats a number as currency', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.number(123456.789, {style: 'currency', currency: 'USD'})
    ).toBe('$123,456.79');
  });

  it('formats a bigint as currency', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.number(123456789123456789n, {
        style: 'currency',
        currency: 'USD'
      })
    ).toBe('$123,456,789,123,456,789.00');
  });
});

describe('relativeTime', () => {
  it('formats a relative time with the second unit', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
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
      timeZone: 'Europe/Berlin'
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
      timeZone: 'Europe/Berlin'
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
      timeZone: 'Europe/Berlin'
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
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.relativeTime(
        parseISO('2022-11-01T00:00:00.000Z'),
        parseISO('2023-01-01T00:00:00.000Z')
      )
    ).toBe('2 months ago');
  });

  it('formats a relative time with the year unit', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.relativeTime(
        parseISO('2022-01-01T00:00:00.000Z'),
        parseISO('2024-01-01T00:00:00.000Z')
      )
    ).toBe('2 years ago');
  });

  describe('numeric representation', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    const now = new Date('2024-01-09T15:00:00.000Z');

    it.each([
      ['2022-07-10T15:00:00.000Z', '2 years ago'],
      ['2022-07-11T15:00:00.000Z', '1 year ago'],
      ['2023-01-09T15:00:00.000Z', '1 year ago'],
      ['2023-01-10T15:00:00.000Z', '12 months ago'],
      ['2023-07-09T15:00:00.000Z', '6 months ago'],
      ['2023-12-09T15:00:00.000Z', '1 month ago'],
      ['2023-12-10T15:00:00.000Z', '4 weeks ago'],
      ['2024-01-02T15:00:00.000Z', '1 week ago'],
      ['2024-01-03T15:00:00.000Z', '6 days ago'],
      ['2024-01-08T15:00:00.000Z', '1 day ago'],
      ['2024-01-08T15:01:00.000Z', '24 hours ago'],
      ['2024-01-09T14:00:00.000Z', '1 hour ago'],
      ['2024-01-09T14:01:00.000Z', '59 minutes ago'],
      ['2024-01-09T14:59:00.000Z', '1 minute ago'],
      ['2024-01-09T14:59:01.000Z', '59 seconds ago'],
      ['2024-01-09T14:59:59.000Z', '1 second ago'],
      ['2024-01-09T14:59:59.999Z', 'now'],

      ['2024-01-09T15:00:00.001Z', 'now'],
      ['2024-01-09T15:00:01.000Z', 'in 1 second'],
      ['2024-01-09T15:00:59.000Z', 'in 59 seconds'],
      ['2024-01-09T15:01:00.000Z', 'in 1 minute'],
      ['2024-01-09T15:59:00.000Z', 'in 59 minutes'],
      ['2024-01-09T16:00:00.000Z', 'in 1 hour'],
      ['2024-01-09T23:59:00.000Z', 'in 9 hours'],
      ['2024-01-10T00:00:00.000Z', 'in 9 hours'],
      ['2024-01-10T14:59:00.000Z', 'in 24 hours'],
      ['2024-01-10T15:00:00.000Z', 'in 1 day'],
      ['2024-01-10T23:59:00.000Z', 'in 1 day'],
      ['2024-01-11T00:00:00.000Z', 'in 1 day'],
      ['2024-01-11T01:00:00.000Z', 'in 1 day'],
      ['2024-01-15T00:00:00.000Z', 'in 5 days'],
      ['2024-01-16T00:00:00.000Z', 'in 6 days'],
      ['2024-01-17T00:00:00.000Z', 'in 1 week'],
      ['2024-01-30T00:00:00.000Z', 'in 3 weeks'],
      ['2024-02-06T00:00:00.000Z', 'in 4 weeks'],
      ['2024-02-06T15:00:00.000Z', 'in 4 weeks'],
      ['2024-02-09T00:00:00.000Z', 'in 4 weeks'],
      ['2024-02-09T01:00:00.000Z', 'in 1 month'],
      ['2024-04-09T00:00:00.000Z', 'in 3 months'],
      ['2024-12-09T00:00:00.000Z', 'in 11 months'],
      ['2024-12-31T00:00:00.000Z', 'in 12 months'],
      ['2025-01-08T00:00:00.000Z', 'in 12 months'],
      ['2025-01-09T00:00:00.000Z', 'in 1 year'],
      ['2025-07-09T00:00:00.000Z', 'in 1 year'],
      ['2025-07-11T00:00:00.000Z', 'in 2 years'],
      ['2026-01-09T00:00:00.000Z', 'in 2 years'],
      ['2026-07-09T00:00:00.000Z', 'in 2 years'],
      ['2026-07-11T00:00:00.000Z', 'in 3 years']
    ])('%s: %s', (value, expected) => {
      expect(formatter.relativeTime(parseISO(value), now)).toBe(expected);
    });
  });

  it('supports the future relative time', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.relativeTime(
        parseISO('2024-01-01T00:00:00.000Z'),
        parseISO('2022-01-01T00:00:00.000Z')
      )
    ).toBe('in 2 years');
  });

  it('formats a relative time with a different style', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.relativeTime(parseISO('2020-03-20T08:30:00.000Z'), {
        now: parseISO('2020-11-22T10:36:00.000Z'),
        style: 'narrow'
      })
    ).toBe('8mo ago');
  });

  it('formats a relative time with options', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.relativeTime(parseISO('2020-03-20T08:30:00.000Z'), {
        now: parseISO('2020-11-22T10:36:00.000Z'),
        unit: 'day',
        numberingSystem: 'arab',
        style: 'narrow'
      })
    ).toBe('٢٤٧d ago');
  });

  it('supports the quarter unit', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.relativeTime(parseISO('2020-01-01T00:00:00.000Z'), {
        now: parseISO('2020-11-01T01:00:00.000Z'),
        unit: 'quarter'
      })
    ).toBe('3 quarters ago');
  });

  it('formats a relative time with a globally defined `now`', () => {
    const formatter = createFormatter({
      locale: 'en',
      now: parseISO('2020-11-20T01:00:00.000Z'),
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.relativeTime(parseISO('2020-11-22T00:00:00.000Z'), {
        unit: 'day'
      })
    ).toBe('in 2 days');
  });
});

describe('dateTimeRange', () => {
  it('formats a date range', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.dateTimeRange(
        new Date(2007, 0, 10, 10, 0, 0),
        new Date(2008, 0, 10, 11, 0, 0),
        {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }
      )
    ).toBe('Wednesday, January 10, 2007 – Thursday, January 10, 2008');

    expect(
      formatter.dateTimeRange(
        new Date(Date.UTC(1906, 0, 10, 10, 0, 0)), // Wed, 10 Jan 1906 10:00:00 GMT
        new Date(Date.UTC(1906, 0, 10, 11, 0, 0)), // Wed, 10 Jan 1906 11:00:00 GMT
        {
          year: '2-digit',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        }
      )
    )
      // 1 hour more given that the timezone is Europe/Berlin and the date is in UTC
      .toBe('1/10/06, 11:00 AM – 12:00 PM');
  });

  it('returns a reasonable fallback if an invalid format is provided', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.dateTimeRange(
        new Date(2007, 0, 10, 10, 0, 0),
        new Date(2008, 0, 10, 11, 0, 0),
        'unknown'
      )
    ).toBe('1/10/2007 – 1/10/2008');
  });

  it('allows to override the time zone', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.dateTimeRange(
        new Date(2007, 0, 10, 10, 0, 0),
        new Date(2008, 0, 10, 11, 0, 0),
        {
          timeStyle: 'medium',
          dateStyle: 'medium',
          timeZone: 'America/New_York'
        }
      )
    ).toBe('Jan 10, 2007, 4:00:00 AM – Jan 10, 2008, 5:00:00 AM');
  });
});

describe('list', () => {
  it('formats a list', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.list(['apple', 'banana', 'orange'], {type: 'disjunction'})
    ).toBe('apple, banana, or orange');
  });

  it('formats a set', () => {
    const formatter = createFormatter({
      locale: 'en',
      timeZone: 'Europe/Berlin'
    });
    expect(
      formatter.list(new Set(['apple', 'banana', 'orange']), {
        type: 'disjunction'
      })
    ).toBe('apple, banana, or orange');
  });
});
