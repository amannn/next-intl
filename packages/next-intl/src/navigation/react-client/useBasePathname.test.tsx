import {render, screen} from '@testing-library/react';
import {usePathname as useNextPathname} from 'next/navigation.js';
import {useLocale} from 'use-intl';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NextIntlClientProvider} from '../../index.react-client.js';
import useBasePathname from './useBasePathname.js';

vi.mock('next/navigation.js');
vi.mock('use-intl', async () => ({
  ...(await vi.importActual('use-intl')),
  useLocale: vi.fn(() => 'en')
}));

function mockPathname(pathname: string) {
  vi.mocked(useNextPathname).mockImplementation(() => pathname);
  vi.mocked(useLocale).mockImplementation(() => 'en');
}

function Component() {
  return useBasePathname({
    localePrefix: {
      // The mode is not used, only the absence of
      // `prefixes` is relevant for this test suite
      mode: 'as-needed'
    }
  });
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
  });

  it('returns `null` when used within a provider', () => {
    const {container} = render(
      <NextIntlClientProvider locale="en">
        <Component />
      </NextIntlClientProvider>
    );
    expect(container.innerHTML).toBe('');
  });
});
