import {UsersIcon} from '@heroicons/react/24/outline';
import {redirect} from 'next/navigation';
import {useLocale, useTranslations} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {z} from 'zod';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import {loginUser} from '@/services/session';
import LoginForm from './LoginForm';

const loginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

type LoginFormInput = z.infer<typeof loginFormSchema>;

export type LoginFormErrors = {
  fieldErrors?: {
    [K in keyof LoginFormInput]?: string[];
  };
  formErrors?: string[];
};

export type LoginFormResult =
  | {
      success: true;
    }
  | {
      success: false;
      errors: LoginFormErrors;
    };

async function loginAction(
  prev: unknown,
  data: FormData
): Promise<LoginFormResult> {
  'use server';
  const t = await getTranslations('LoginPage');
  const values = Object.fromEntries(data);

  const result = await loginFormSchema.safeParseAsync(values, {
    error(issue) {
      if (issue.path) {
        const key = issue.path.join('.');
        const message = {
          email: t('invalidEmail'),
          password: t('invalidPassword')
        }[key];
        return message;
      }
    }
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten()
    };
  }

  const isLoggedIn = await loginUser(result.data);
  if (!isLoggedIn) {
    return {
      success: false,
      errors: {
        formErrors: [t('invalidCredentials')]
      }
    };
  }

  redirect('/app');
}

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const locale = useLocale();

  return (
    <>
      <div className="absolute right-8 top-8">
        <LocaleSwitcher />
      </div>
      <LoginForm
        key={locale}
        action={loginAction}
        fields={
          <div className="flex flex-col gap-5">
            <FormField
              label={t('email')}
              name="email"
              placeholder="jane@doe.com"
              required
              type="email"
            />
            <FormField
              label={t('password')}
              name="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>
        }
        header={
          <div className="text-center">
            <UsersIcon className="mx-auto h-14 w-14 text-slate-900" />
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
              {t('title')}
            </h1>
            <p className="mt-2 text-slate-700">{t('description')}</p>
          </div>
        }
        submit={
          <div>
            <Button type="submit">{t('login')}</Button>
            <p className="mt-4 text-center text-sm text-slate-700">
              {t('credentials')}
            </p>
          </div>
        }
      />
    </>
  );
}
