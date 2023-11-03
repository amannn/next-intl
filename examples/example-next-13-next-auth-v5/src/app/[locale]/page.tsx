import auth from 'auth';
import Index from './Index';

export default async function IndexPage() {
  const session = await auth();
  return <Index session={session} />;
}
