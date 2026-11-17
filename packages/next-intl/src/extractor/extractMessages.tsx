import {extractMessages as extractAll} from '@eloqnt/extractor/_internal';
import prefixUserError from '../plugin/prefixUserError.js';
import {warn} from '../plugin/utils.js';
import normalizeExtractorConfig from './normalizeExtractorConfig.js';
import type {ExtractorConfigInput} from './types.js';
import {getDefaultProjectRoot, hasLocalesToExtract} from './utils.js';

export default async function extractMessages(params: ExtractorConfigInput) {
  const config = normalizeExtractorConfig(params);

  if (!hasLocalesToExtract(config)) {
    warn('`messages.locales` is empty, so no messages were updated.');
    return;
  }

  try {
    await extractAll(config, {projectRoot: getDefaultProjectRoot(), warn});
  } catch (error) {
    throw prefixUserError(error);
  }
}
