import {it} from 'vitest';
import hasLocale from './hasLocale.tsx';

it('narrows down the type', () => {
  const locales = ['en-US', 'en-GB'] as const;
  const candidate = 'en-US' as string;
  if (hasLocale(locales, candidate)) {
    candidate satisfies (typeof locales)[number];
  }
});

it('can be called with a matching narrow candidate', () => {
  const locales = ['en-US', 'en-GB'] as const;
  const candidate = 'en-US' as const;
  if (hasLocale(locales, candidate)) {
    candidate satisfies (typeof locales)[number];
  }
});

it('can be called with a non-matching narrow candidate', () => {
  const locales = ['en-US', 'en-GB'] as const;
  const candidate = 'de' as const;
  if (hasLocale(locales, candidate)) {
    candidate satisfies never;
  }
});
