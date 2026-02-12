import ClientBoundary from '@/components/ClientBoundary';
import dynamic from 'next/dynamic';
import {lazy} from 'react';

const DynamicImportContent = dynamic(() => import('./DynamicImportContent'));
const LazyImportContent = lazy(() => import('./LazyImportContent'));

export default function DynamicImportPage() {
  return (
    <ClientBoundary>
      <DynamicImportContent />
      <LazyImportContent />
    </ClientBoundary>
  );
}
