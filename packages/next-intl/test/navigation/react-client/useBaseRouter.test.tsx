import {render} from '@testing-library/react';
import {PrefetchKind} from 'next/dist/client/components/router-reducer/router-reducer-types';
import {AppRouterInstance} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {useRouter as useNextRouter} from 'next/navigation';
import React, {useEffect} from 'react';
import {it, describe, vi, beforeEach, expect} from 'vitest';
import useBaseRouter from '../../../src/navigation/react-client/useBaseRouter';

vi.mock('next/navigation', () => {
  const router: AppRouterInstance = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn()
  };
  return {
    useRouter: () => router,
    useParams: () => ({locale: 'en'}),
    usePathname: () => '/'
  };
});

function callRouter(cb: (router: ReturnType<typeof useBaseRouter>) => void) {
  function Component() {
    const router = useBaseRouter();
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

  it('can change the locale with `push`', () => {
    callRouter((router) => router.push('/about', {locale: 'de'}));
    expect(useNextRouter().push).toHaveBeenCalledWith('/de/about');
  });

  it('can change the locale with `replace`', () => {
    callRouter((router) => router.replace('/about', {locale: 'es'}));
    expect(useNextRouter().replace).toHaveBeenCalledWith('/es/about');
  });

  it('can prefetch a new locale', () => {
    callRouter((router) =>
      router.prefetch('/about', {locale: 'es', kind: PrefetchKind.AUTO})
    );
    expect(useNextRouter().prefetch).toHaveBeenCalledWith('/es/about', {
      kind: PrefetchKind.AUTO
    });
  });

  it('keeps the cookie value in sync', () => {
    document.cookie = 'NEXT_LOCALE=en';

    callRouter((router) => router.push('/about', {locale: 'de'}));
    expect(document.cookie).toContain('NEXT_LOCALE=de');

    callRouter((router) => router.push('/test'));
    expect(document.cookie).toContain('NEXT_LOCALE=de');

    callRouter((router) => router.replace('/about', {locale: 'es'}));
    expect(document.cookie).toContain('NEXT_LOCALE=es');

    callRouter((router) =>
      router.prefetch('/about', {locale: 'it', kind: PrefetchKind.AUTO})
    );
    expect(document.cookie).toContain('NEXT_LOCALE=it');
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

describe('basePath unprefixed routing', () => {
  beforeEach(() => {
    mockLocation('/base/');
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

describe('basePath prefixed routing', () => {
  beforeEach(() => {
    mockLocation('/base/en');
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
