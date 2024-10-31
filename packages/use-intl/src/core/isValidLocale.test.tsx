import {it} from 'vitest';
import isValidLocale from './isValidLocale.tsx';

it('narrows down the type', () => {
  const locales = ['en-US', 'en-GB'] as const;
  const candidate = 'en-US' as string;
  if (isValidLocale(locales, candidate)) {
    candidate satisfies (typeof locales)[number];
  }
});
