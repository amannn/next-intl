'use client';

import {ReactNode, useActionState} from 'react';
import {FormResult} from './ZodFormExample';
// no type declaration here, this could be an issue

// tricky cases:
// - type declaration from server
// - importing server action from server (can contain jsx)

// prod-only behavior is not good, because we might miss messages
// but there's also the problem with segments without a layout (which therefore rely on parent layouts)

type Props = {
  action(prev: unknown, data: FormData): Promise<FormResult>;
  children: ReactNode;
};

export default function ZodForm({action, children}: Props) {
  const [state, formAction] = useActionState(action, null);
  const hasErrors = state && !state.success;

  return (
    <form action={formAction}>
      {children}
      {hasErrors && <p>{state.errors.fieldErrors?.task?.join(', ')}</p>}
    </form>
  );
}
