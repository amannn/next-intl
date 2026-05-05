import ProfileCard from 'e2e-shared-ui/ProfileCard';
import {useExtracted} from 'next-intl';

export default function Page() {
  const t = useExtracted();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t('First-party headline')}</h1>
      <ProfileCard />
    </div>
  );
}
