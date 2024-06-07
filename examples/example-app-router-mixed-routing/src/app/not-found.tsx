'use client';

import Document from '@/components/Document';
import Error from 'next/error';

export default function NotFound() {
  return (
    <Document locale="en">
      <Error statusCode={404} />
    </Document>
  );
}
