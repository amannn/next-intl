import {render, screen} from '@testing-library/react';
import React from 'react';
import {it, vi} from 'vitest';
import {useLocale} from '../../src';

vi.mock('next/navigation', () => ({
  useParams: () => ({locale: 'en'})
}));

it('returns a locale from `useParams` without a provider', () => {
  function Component() {
    return <>{useLocale()}</>;
  }

  render(<Component />);
  screen.getByText('en');
});
