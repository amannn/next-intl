import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import DynamicSlugPageContent from './DynamicSlugPageContent';
import {use} from 'react';

export default function DynamicSlugPage({
  params
}: PageProps<'/dynamic-segment/[slug]'>) {
  const {slug} = use(params);
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <DynamicSlugPageContent slug={slug} />
    </NextIntlClientProvider>
  );
}
