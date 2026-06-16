import {useExtracted} from 'next-intl';

export function ServerExample() {
  const t = useExtracted();
  return (
    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
      {t('Hello, world!')}
    </p>
  );
}
