export {
  aggregateMessage,
  fillUnownedFields,
  getLocaleMessages,
  groupSourceMessagesById,
  isExtractorOwnedKey
} from './catalog/mergeMessages.js';
export {default as extractMessages} from './extractMessages.js';
export {default as MessageExtractor} from './extractor/MessageExtractor.js';
export {default as SourceFileFilter} from './source/SourceFileFilter.js';
export {default as SourceFileScanner} from './source/SourceFileScanner.js';
export type {ExtractorConfig, SourceExtractedMessage} from './types.js';
export {getSrcPaths} from './utils.js';
