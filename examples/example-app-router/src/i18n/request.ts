import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import { Formats } from 'next-intl';

export const formats = {
  dateTime: {
    short: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  },
  number: {
    precise: {
      maximumFractionDigits: 5
    }
  },
  list: {
    enumeration: {
      style: 'long',
      type: 'conjunction'
    }
  }
} as const satisfies Partial<Formats>


export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) notFound();

  return {
    messages: (
      await (locale === 'en'
        ? // When using Turbopack, this will enable HMR for `en`
          import('../../messages/en.json')
        : import(`../../messages/${locale}.json`))
    ).default,
    formats
  }
});
