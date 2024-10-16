'use client';

import {ReactNode} from 'react';
// @ts-expect-error -- Not exported in latest types
import {useActionState} from 'react-dom';
import {FormResult} from './ZodFormExample';

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
      {hasErrors && <p>{state.fieldErrors.task?.join(', ')}</p>}
    </form>
  );
}
