'use client';

import SharedComponent from '@/components/SharedComponent';
import ClientBoundary from '@/components/ClientBoundary';

export default function SharedComponentPageContent() {
  return (
    <ClientBoundary>
      <SharedComponent />
    </ClientBoundary>
  );
}
