import {Languages} from 'lucide-react';
import {useExtracted} from 'next-intl';

export default function useNavSections() {
  const t = useExtracted();

  return [
    {
      title: t('Translations'),
      icon: Languages,
      items: [
        {
          slug: '/translations/server-components',
          title: t('Server Components'),
          description: t('Read translated strings inside Server Components.')
        },
        {
          slug: '/translations/client-components',
          title: t('Client Components'),
          description: t('Use translations in interactive Client Components.')
        }
      ]
    }
  ];
}
