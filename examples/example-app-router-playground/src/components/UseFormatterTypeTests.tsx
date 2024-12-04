import {useFormatter} from 'next-intl';
import {getFormatter} from 'next-intl/server';

export function RegularComponent() {
  const format = useFormatter();

  format.dateTime(new Date(), 'medium');
  format.dateTime(new Date(), 'long');
  // @ts-expect-error
  format.dateTime(new Date(), 'unknown');

  format.dateTimeRange(new Date(), new Date(), 'medium');
  // @ts-expect-error
  format.dateTimeRange(new Date(), new Date(), 'unknown');

  format.number(420, 'precise');
  // @ts-expect-error
  format.number(420, 'unknown');

  format.list(['this', 'is', 'a', 'list'], 'enumeration');
  // @ts-expect-error
  format.list(['this', 'is', 'a', 'list'], 'unknown');
}

export async function AsyncComponent() {
  const format = await getFormatter();

  format.dateTime(new Date(), 'medium');
  format.dateTime(new Date(), 'long');
  // @ts-expect-error
  format.dateTime(new Date(), 'unknown');

  format.dateTimeRange(new Date(), new Date(), 'medium');
  // @ts-expect-error
  format.dateTimeRange(new Date(), new Date(), 'unknown');

  format.number(420, 'precise');
  // @ts-expect-error
  format.number(420, 'unknown');

  format.list(['this', 'is', 'a', 'list'], 'enumeration');
  // @ts-expect-error
  format.list(['this', 'is', 'a', 'list'], 'unknown');
}
