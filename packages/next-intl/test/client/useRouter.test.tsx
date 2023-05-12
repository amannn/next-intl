import {render} from '@testing-library/react';
import {AppRouterInstance} from 'next/dist/shared/lib/app-router-context';
import {useRouter as useNextRouter} from 'next/navigation';
import React, {useEffect} from 'react';
import {useRouter} from '../../src/client';

jest.mock('next/navigation', () => {
  const router: AppRouterInstance = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn()
  };
  return {
    useRouter: () => router,
    useParams: () => ({locale: 'en'})
  };
});

function callRouter(cb: (router: AppRouterInstance) => void) {
  function Component() {
    const router = useRouter();
    useEffect(() => {
      cb(router);
    }, [router]);
    return null;
  }

  render(<Component />);
}

function mockLocation(pathname: string) {
  delete (global.window as any).location;
  global.window ??= Object.create(window);
  (global.window as any).location = {pathname};
}

describe('unprefixed routing', () => {
  beforeEach(() => {
    mockLocation('/');
  });

  it('can push', () => {
    callRouter((router) => router.push('/test'));
    expect(useNextRouter().push).toHaveBeenCalledWith('/test');
  });

  it('can replace', () => {
    callRouter((router) => router.replace('/test'));
    expect(useNextRouter().replace).toHaveBeenCalledWith('/test');
  });

  it('can prefetch', () => {
    callRouter((router) => router.prefetch('/test'));
    expect(useNextRouter().prefetch).toHaveBeenCalledWith('/test');
  });

  it('passes through absolute urls', () => {
    callRouter((router) => router.push('https://example.com'));
    expect(useNextRouter().push).toHaveBeenCalledWith('https://example.com');
  });

  it('passes through relative urls', () => {
    callRouter((router) => router.push('about'));
    expect(useNextRouter().push).toHaveBeenCalledWith('about');
  });
});

describe('prefixed routing', () => {
  beforeEach(() => {
    mockLocation('/en');
  });

  it('can push', () => {
    callRouter((router) => router.push('/test'));
    expect(useNextRouter().push).toHaveBeenCalledWith('/en/test');
  });

  it('can replace', () => {
    callRouter((router) => router.replace('/test'));
    expect(useNextRouter().replace).toHaveBeenCalledWith('/en/test');
  });

  it('can prefetch', () => {
    callRouter((router) => router.prefetch('/test'));
    expect(useNextRouter().prefetch).toHaveBeenCalledWith('/en/test');
  });

  it('passes through absolute urls', () => {
    callRouter((router) => router.push('https://example.com'));
    expect(useNextRouter().push).toHaveBeenCalledWith('https://example.com');
  });

  it('passes through relative urls', () => {
    callRouter((router) => router.push('about'));
    expect(useNextRouter().push).toHaveBeenCalledWith('about');
  });
});
