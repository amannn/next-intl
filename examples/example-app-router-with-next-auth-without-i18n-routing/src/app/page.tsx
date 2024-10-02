import {redirect} from 'next/navigation';
import {getServerSession} from 'next-auth';
import {authOptions} from './api/auth/auth';

export default async function IndexPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/app');
  } else {
    redirect('/login');
  }
}
