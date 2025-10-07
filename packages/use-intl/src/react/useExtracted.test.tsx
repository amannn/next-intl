import {render, screen} from '@testing-library/react';
import type {ComponentProps, ReactNode} from 'react';
import {expect, it, vi} from 'vitest';
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

// there are two cases:
// - if useExtracted never gets compiled (like here)
// - where it does get compiled and we provide a fallback (when waiting for messages) (we still need to implement this in the transformer)

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
