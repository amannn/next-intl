import getServerExtractor from '../server/react-server/getServerExtractor.js';
import useConfig from './useConfig.js';

export default function useExtracted(
  namespace?: string
): ReturnType<typeof getServerExtractor> {
  const config = useConfig('useExtracted');
  return getServerExtractor(config, namespace);
}
