import {render, screen} from '@testing-library/react';
import {usePathname as useNextPathname, useParams} from 'next/navigation';
import React from 'react';
import {it, describe, vi, beforeEach, expect} from 'vitest';
import {NextIntlClientProvider} from '../../../src';
import useBasePathname from '../../../src/navigation/react-client/useBasePathname';

vi.mock('next/navigation');

function mockPathname(pathname: string) {
  vi.mocked(useNextPathname).mockImplementation(() => pathname);
  vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
}

function Component() {
  const pathname = useBasePathname({
    // The mode is not used, only the absence of
    // `prefixes` is relevant for this test suite
    mode: 'as-needed'
  });
  return <>{pathname}</>;
}

describe('unprefixed routing', () => {
  it('returns an unprefixed pathname', () => {
    mockPathname('/');
    render(<Component />);
    screen.getByText('/');
  });

  it('returns an unprefixed pathname at sub paths', () => {
    mockPathname('/about');
    render(<Component />);
    screen.getByText('/about');
  });
});

describe('prefixed routing', () => {
  it('returns an unprefixed pathname', () => {
    mockPathname('/en');
    render(<Component />);
    screen.getByText('/');
  });

  it('returns an unprefixed pathname at sub paths', () => {
    mockPathname('/en/about');
    render(<Component />);
    screen.getByText('/about');
  });
});

describe('usage outside of Next.js', () => {
  beforeEach(() => {
    vi.mocked(useNextPathname).mockImplementation((() => null) as any);
    vi.mocked(useParams).mockImplementation((() => null) as any);
  });

  it('returns `null` when used within a provider', () => {
    const {container} = render(
      <NextIntlClientProvider locale="en">
        <Component />
      </NextIntlClientProvider>
    );
    expect(container.innerHTML).toBe('');
  });

  it('throws without a provider', () => {
    expect(() => render(<Component />)).toThrow(
      'No intl context found. Have you configured the provider?'
    );
  });
});
