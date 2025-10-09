import {render, screen} from '@testing-library/react';
import type {ComponentProps, ReactNode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import IntlProvider from './IntlProvider.js';
import useExtracted from './useExtracted.js';

function MockProvider(
  props: Partial<ComponentProps<typeof IntlProvider>> & {children: ReactNode}
) {
  return (
    <IntlProvider
      locale="en"
      messages={{}} // Only use fallbacks
      {...props}
    >
      {props.children}
    </IntlProvider>
  );
}

it('accepts plain messages', () => {
  const onError = vi.fn();
  function Component() {
    const t = useExtracted();
    return t('Hello');
  }
  render(
    <MockProvider onError={onError}>
      <Component />
    </MockProvider>
  );
  expect(onError).not.toHaveBeenCalled();
  screen.getByText('Hello');
});

it('accepts ICU arguments', () => {
  const onError = vi.fn();
  function Component() {
    const t = useExtracted();
    return t('Hello {name}', {name: 'World'});
  }
  render(
    <MockProvider onError={onError}>
      <Component />
    </MockProvider>
  );
  expect(onError).not.toHaveBeenCalled();
  screen.getByText('Hello World');
});

it('validates that values are passed when required', () => {
  const onError = vi.fn();
  function Component() {
    const t = useExtracted();
    // @ts-expect-error -- Missing values
    return t('Hello {name}');
  }
  render(
    <MockProvider onError={onError}>
      <Component />
    </MockProvider>
  );
  expect(onError).toHaveBeenCalled();
  screen.getByText('Hello {name}');
});

it('renders the fallback when formatting fails', () => {
  const onError = vi.fn();
  const getMessageFallback = vi.fn();
  function Component() {
    const t = useExtracted();
    // @ts-expect-error -- Missing argument
    return t('Hello {name}');
  }
  render(
    <MockProvider getMessageFallback={getMessageFallback} onError={onError}>
      <Component />
    </MockProvider>
  );
  expect(onError).toHaveBeenCalled();
  expect(getMessageFallback).not.toHaveBeenCalled();
  screen.getByText('Hello {name}');
});

it('renders the fallback when ICU compilation fails', () => {
  const onError = vi.fn();
  const getMessageFallback = vi.fn();
  function Component() {
    const t = useExtracted();
    return t('Hello {name');
  }
  render(
    <MockProvider getMessageFallback={getMessageFallback} onError={onError}>
      <Component />
    </MockProvider>
  );
  expect(onError).toHaveBeenCalled();
  expect(getMessageFallback).not.toHaveBeenCalled();
  screen.getByText('Hello {name');
});

it('accepts rich text messages', () => {
  function Component() {
    const t = useExtracted();
    return t.rich('Hello <b>Jan</b>', {b: (chunks) => <b>{chunks}</b>});
  }
  const {container} = render(
    <MockProvider>
      <Component />
    </MockProvider>
  );
  expect(container.innerHTML).toBe('Hello <b>Jan</b>');
});

it('accepts markup messages', () => {
  function Component() {
    const t = useExtracted();
    return t.markup('Hello <b>Jan</b>', {b: (chunks) => `<b>${chunks}</b>`});
  }
  render(
    <MockProvider>
      <Component />
    </MockProvider>
  );
  screen.getByText('Hello <b>Jan</b>');
});

it('supports .has', () => {
  function Component() {
    const t = useExtracted();
    return String(t.has('Hello'));
  }
  render(
    <MockProvider>
      <Component />
    </MockProvider>
  );
  screen.getByText('true');
});

it("doesn't accept raw messages", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function Component() {
    const t = useExtracted();
    // @ts-expect-error -- Raw messages are not accepted
    return t.raw('Hello {name}', {name: 'World'});
  }
});

it('accepts an optional namespace', () => {
  const onError = vi.fn();
  function Component() {
    const t = useExtracted('design-system');
    return t('Hello');
  }
  render(
    <MockProvider onError={onError}>
      <Component />
    </MockProvider>
  );
  expect(onError).toHaveBeenCalled();
  screen.getByText('Hello');
});

describe('object form', () => {
  it('accepts an object form for explicit ids', () => {
    function Component() {
      const t = useExtracted();
      return t({id: 'greeting', message: 'Hello'});
    }
    render(
      <MockProvider>
        <Component />
      </MockProvider>
    );
    screen.getByText('Hello');
  });

  it('allows passing values', () => {
    function Component() {
      const t = useExtracted();
      return t({
        id: 'greeting',
        message: 'Hello {name}',
        values: {name: 'World'}
      });
    }
    render(
      <MockProvider>
        <Component />
      </MockProvider>
    );
    screen.getByText('Hello World');
  });

  it('allows passing values and formats', () => {
    function Component() {
      const t = useExtracted();
      return t({
        id: 'greeting',
        message: 'Hello {name}, {count, number, precise}',
        values: {name: 'World', count: 1.5},
        formats: {number: {precise: {minimumFractionDigits: 5}}}
      });
    }
    render(
      <MockProvider>
        <Component />
      </MockProvider>
    );
    screen.getByText('Hello World, 1.50000');
  });

  it('validates that values are passed when required', () => {
    const onError = vi.fn();
    function Component() {
      const t = useExtracted();
      // @ts-expect-error -- Missing values
      return t({id: 'greeting', message: 'Hello {name}'});
    }
    render(
      <MockProvider onError={onError}>
        <Component />
      </MockProvider>
    );
    expect(onError).toHaveBeenCalled();
    screen.getByText('Hello {name}');
  });

  it('validates that the right values are passed', () => {
    const onError = vi.fn();
    function Component() {
      const t = useExtracted();
      // @ts-expect-error -- Missing values
      return t({id: 'greeting', message: 'Hello {name}', values: {count: 1}});
    }
    render(
      <MockProvider onError={onError}>
        <Component />
      </MockProvider>
    );
    expect(onError).toHaveBeenCalled();
    screen.getByText('Hello {name}');
  });
});
