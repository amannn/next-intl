'use client';

import {ReactNode, useActionState} from 'react';
import LoginFormErrors from './LoginFormErrors';
import {LoginFormResult} from './page';

export default function LoginForm({
  action,
  fields,
  header,
  submit
}: {
  action(prev: unknown, data: FormData): Promise<LoginFormResult>;
  fields: ReactNode;
  header: ReactNode;
  submit: ReactNode;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form
      action={formAction}
      className="mx-auto my-20 w-full max-w-[24rem] px-4"
    >
      {header}
      <div className="mb-10 mt-14">
        {fields}
        {state?.success === false && (
          <div className="mt-4">
            <LoginFormErrors errors={state.errors} />
          </div>
        )}
      </div>
      {submit}
    </form>
  );
}
