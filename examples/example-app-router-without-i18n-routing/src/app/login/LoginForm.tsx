'use client';

import {ExclamationTriangleIcon} from '@heroicons/react/24/outline';
import {ReactNode} from 'react';
import {useFormState} from 'react-dom';
import {FormResult} from './page';

export default function LoginForm({
  action,
  fields,
  header,
  submit
}: {
  action(prev: unknown, data: FormData): Promise<FormResult>;
  fields: ReactNode;
  header: ReactNode;
  submit: ReactNode;
}) {
  const [state, formAction] = useFormState(action, null);

  return (
    <form action={formAction} className="mx-auto my-20 max-w-[24rem] px-4">
      {header}
      <div className="my-10">
        {fields}
        {!state?.success && (
          <div className="mt-4">
            {state?.errors.formErrors.map((error, i) => (
              <p key={i} className="font-semibold">
                <ExclamationTriangleIcon className="inline-block h-5 w-5" />{' '}
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
      {submit}
    </form>
  );
}
