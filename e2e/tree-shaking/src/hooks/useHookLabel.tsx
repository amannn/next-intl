import {useExtracted} from 'next-intl';

export default function useHookLabel(): string {
  const t = useExtracted();
  return t('Hook test label');
}
