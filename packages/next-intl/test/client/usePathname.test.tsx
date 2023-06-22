import {render, screen} from '@testing-library/react';
import {usePathname as useNextPathname, useParams} from 'next/navigation';
import React from 'react';
import {NextIntlClientProvider} from '../../src';
import {usePathname} from '../../src/client';

jest.mock('next/navigation');

function mockPathname(pathname: string) {
  jest.mocked(useNextPathname).mockImplementation(() => pathname);
  jest.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
}

function Component() {
  return <>{usePathname()}</>;
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
    jest.mocked(useNextPathname).mockImplementation((() => null) as any);
    jest.mocked(useParams).mockImplementation((() => null) as any);
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
