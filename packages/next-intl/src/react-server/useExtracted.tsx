import getServerExtractor from '../server/react-server/getServerExtractor.js';
import useConfig from './useConfig.js';

export default function useExtracted(namespace?: string) {
  const config = useConfig('useExtracted');
  return getServerExtractor(config, namespace);
}
