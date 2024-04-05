import type {useFormats as useFormatsType} from 'use-intl';
import {getFormatsFromConfig} from '../server/react-server/getFormats';
import useConfig from './useConfig';

export default function useFormats(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useFormatsType>
): ReturnType<typeof useFormatsType> {
  const config = useConfig('useFormats');
  return getFormatsFromConfig(config);
}
