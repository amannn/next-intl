import {redirect} from 'next/navigation';
import {getServerSession} from 'next-auth';
import {getTranslations} from 'next-intl/server';
import {authOptions} from '../api/auth/auth';

export default async function AppPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const t = await getTranslations('HomePage');

  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tight">
        {t('welcome', {name: session.user?.name})}
      </h1>
    </div>
  );
}
