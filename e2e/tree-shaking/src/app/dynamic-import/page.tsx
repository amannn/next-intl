import dynamic from 'next/dynamic';
import {lazy} from 'react';

const DynamicImportContent = dynamic(() => import('./DynamicImportContent'));
const LazyImportContent = lazy(() => import('./LazyImportContent'));

export default function DynamicImportPage() {
  return (
    <div>
      <h2>Dynamic import page</h2>
      <DynamicImportContent />
      <LazyImportContent />
    </div>
  );
}
