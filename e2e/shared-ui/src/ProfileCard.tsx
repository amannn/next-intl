'use client';

import {useExtracted} from 'next-intl';

export default function ProfileCard() {
  const t = useExtracted();

  return (
    <article className="border border-gray-300 rounded-md p-3">
      <h2 className="font-medium">
        {t({
          id: 'linkedDependency.profileCard.title',
          message: 'Profile card'
        })}
      </h2>
    </article>
  );
}
