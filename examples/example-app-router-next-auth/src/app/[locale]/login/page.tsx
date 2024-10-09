'use client';

import {useRouter} from 'next/navigation';
import {signIn} from 'next-auth/react';
import {useLocale, useTranslations} from 'next-intl';
import {FormEvent, useState} from 'react';
import PageLayout from '@/components/PageLayout';

export default function Login() {
  const locale = useLocale();
  const t = useTranslations('Login');
  const [error, setError] = useState<string>();
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (error) setError(undefined);

    const formData = new FormData(event.currentTarget);
    signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirect: false
    }).then((result) => {
      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/' + locale);
      }
    });
  }

  return (
    <PageLayout title={t('title')}>
      <form
        action="/api/auth/callback/credentials"
        method="post"
        onSubmit={onSubmit}
        style={{display: 'flex', flexDirection: 'column', gap: 10, width: 300}}
      >
        <label style={{display: 'flex'}}>
          <span style={{display: 'inline-block', flexGrow: 1, minWidth: 100}}>
            {t('username')}
          </span>
          <input name="username" type="text" />
        </label>
        <label style={{display: 'flex'}}>
          <span style={{display: 'inline-block', flexGrow: 1, minWidth: 100}}>
            {t('password')}
          </span>
          <input name="password" type="password" />
        </label>
        {error && <p>{t('error', {error})}</p>}
        <button type="submit">{t('submit')}</button>
      </form>
    </PageLayout>
  );
}
