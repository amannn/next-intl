'use client';

import {useRouter} from 'next/navigation';
import {signIn} from 'next-auth/react';
import {useTranslations} from 'next-intl';
import {useState} from 'react';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const router = useRouter();
  const [error, setError] = useState('');

  // eslint-disable-next-line func-style
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const username = event.currentTarget.username.value;
    const password = event.currentTarget.password.value;

    const res = await signIn('credentials', {
      redirect: false,
      username,
      password
    });

    if (res?.error) {
      setError(t('invalidCredentials'));
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="mb-6 w-full max-w-md" onSubmit={handleSubmit}>
        <h1 className="mb-6 text-center text-2xl font-semibold">
          {t('title')}
        </h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <div className="mb-4">
          <label className="mb-1 block">{t('username')}</label>
          <input
            className="w-full rounded border px-3 py-2"
            name="username"
            required
            type="text"
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block">{t('password')}</label>
          <input
            className="w-full rounded border px-3 py-2"
            name="password"
            required
            type="password"
          />
        </div>
        <button
          className="mb-6 w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          type="submit"
        >
          {t('login')}
        </button>
        {t('credentials')}
      </form>
    </div>
  );
}
