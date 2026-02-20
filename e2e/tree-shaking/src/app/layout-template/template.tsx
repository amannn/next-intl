import type {ReactNode} from 'react';
import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import LayoutTemplateTemplateContent from './LayoutTemplateTemplateContent';

type Props = {children: ReactNode};

export default function LayoutTemplateTemplate({children}: Props) {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <LayoutTemplateTemplateContent>{children}</LayoutTemplateTemplateContent>
    </NextIntlClientProvider>
  );
}
