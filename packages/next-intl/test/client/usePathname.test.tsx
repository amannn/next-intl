import {render, screen} from '@testing-library/react';
import {usePathname as useNextPathname, useParams} from 'next/navigation';
import React from 'react';
import {usePathname} from '../../src/client';

jest.mock('next/navigation');

function mockPathname(pathname: string) {
  jest.mocked(useNextPathname).mockImplementation(() => pathname);
  jest.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
}

function renderComponent() {
  function Component() {
    return <>{usePathname()}</>;
  }

  render(<Component />);
}

describe('unprefixed routing', () => {
  it('returns an unprefixed pathname', () => {
    mockPathname('/');
    renderComponent();
    screen.getByText('/');
  });

  it('returns an unprefixed pathname at sub paths', () => {
    mockPathname('/about');
    renderComponent();
    screen.getByText('/about');
  });
});

describe('prefixed routing', () => {
  it('returns an unprefixed pathname', () => {
    mockPathname('/en');
    renderComponent();
    screen.getByText('/');
  });

  it('returns an unprefixed pathname at sub paths', () => {
    mockPathname('/en/about');
    renderComponent();
    screen.getByText('/about');
  });
});
