'use client';

import {Suspense, use} from 'react';
import {Link} from '@/i18n/navigation';

function DynamicContent({params}: PageProps<'/link.test/[slug]'>) {
  const {slug} = use(params);
  return <h1>Dynamic page: {slug}</h1>;
}

export default function DynamicPage(props: PageProps<'/link.test/[slug]'>) {
  return (
    <Suspense fallback={<Link href="/">Go to home page</Link>}>
      <DynamicContent {...props} />
    </Suspense>
  );
}
