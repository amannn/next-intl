import {Link} from '@/i18n/navigation';

// The dynamic `[slug]` param ensures that the pathname of this
// route is unknown when the shell is prerendered. Regardless of
// this, `Link` should not require a `Suspense` boundary.
export default function DynamicPage() {
  return (
    <main>
      <h1>Dynamic page</h1>
      <Link href="/">Go to home page</Link>
    </main>
  );
}
