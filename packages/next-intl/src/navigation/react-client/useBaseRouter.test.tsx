import {render} from '@testing-library/react';
import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
  type useRouter
} from 'next/navigation.js';
import {useEffect} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import useBaseRouter from './useBaseRouter.tsx';

vi.mock('next/navigation.js', () => {
  const router: ReturnType<typeof useRouter> = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn()
  };
  return {
    useRouter: vi.fn(() => router),
    useParams: vi.fn(() => ({locale: 'en'})),
    usePathname: vi.fn(() => '/')
  };
});

function callRouter(cb: (router: ReturnType<typeof useBaseRouter>) => void) {
  function Component() {
    const router = useBaseRouter(
      {
        // The mode is not used, only the absence of
        // `prefixes` is relevant for this test suite
        mode: 'as-needed'
      },
      {
        name: 'NEXT_LOCALE',
        maxAge: 31536000,
        sameSite: 'lax'
      }
    );
    useEffect(() => {
      cb(router);
    }, [router]);
    return null;
  }

  render(<Component />);
}

function mockLocation(pathname: string, basePath = '') {
  vi.mocked(useNextPathname).mockReturnValue(pathname);

  delete (global.window as any).location;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  global.window ??= Object.create(window);
  (global.window as any).location = {pathname: basePath + pathname};
}

function clearNextRouterMocks() {
  ['push', 'replace', 'prefetch', 'back', 'forward', 'refresh'].forEach(
    (fnName) => {
      vi.mocked((useNextRouter() as any)[fnName]).mockClear();
    }
  );
}

describe('unprefixed routing', () => {
  beforeEach(() => {
    mockLocation('/');
    clearNextRouterMocks();
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
      router.prefetch('/about', {
        locale: 'es',
        // @ts-expect-error -- Somhow only works via the enum (which is not exported)
        kind: 'auto'
      })
    );
    expect(useNextRouter().prefetch).toHaveBeenCalledWith('/es/about', {
      kind: 'auto'
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
      router.prefetch('/about', {
        locale: 'it',
        // @ts-expect-error -- Somhow only works via the enum (which is not exported)
        kind: 'auto'
      })
    );
    expect(document.cookie).toContain('NEXT_LOCALE=it');
  });
});

describe('prefixed routing', () => {
  beforeEach(() => {
    mockLocation('/en');
    clearNextRouterMocks();
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
    mockLocation('/', '/base/path');
    clearNextRouterMocks();
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
    mockLocation('/en', '/base/path');
    clearNextRouterMocks();
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
