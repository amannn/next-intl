import {getServerSession} from 'next-auth';
import Index from './Index';
import auth from '@/auth';

export default async function IndexPage() {
  const session = await getServerSession(auth);
  return <Index session={session} />;
}
