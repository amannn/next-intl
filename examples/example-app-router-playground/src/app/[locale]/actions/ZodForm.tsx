'use client';

import {ReactNode} from 'react';
import {useFormState} from 'react-dom';
import {FormResult} from './ZodFormExample';

type Props = {
  action(prev: unknown, data: FormData): Promise<FormResult>;
  children: ReactNode;
};

export default function ZodForm({action, children}: Props) {
  const [state, formAction] = useFormState(action, null);
  const hasErrors = state && !state.success;

  return (
    <form action={formAction}>
      {children}
      {hasErrors && <p>{state.fieldErrors.task?.join(', ')}</p>}
    </form>
  );
}
