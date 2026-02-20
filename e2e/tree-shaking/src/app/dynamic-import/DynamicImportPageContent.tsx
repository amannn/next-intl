'use client';

import dynamic from 'next/dynamic';
import {lazy, Suspense} from 'react';

const DynamicImportContent = dynamic(() => import('./DynamicImportContent'));
const LazyImportContent = lazy(() => import('./LazyImportContent'));

export default function DynamicImportPageContent() {
  return (
    <>
      <DynamicImportContent />
      <Suspense fallback={null}>
        <LazyImportContent />
      </Suspense>
    </>
  );
}
