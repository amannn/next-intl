import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider} from 'next-intl';
import ProfileCard from 'shared-ui/ProfileCard';

export default function LinkedDependencyPage() {
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <ProfileCard />
    </NextIntlClientProvider>
  );
}
