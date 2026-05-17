export {default as ExtractionCompiler} from './ExtractionCompiler.js';
export {default as MessageExtractor} from './extractor/MessageExtractor.js';
export {default as normalizeExtractorConfig} from './normalizeExtractorConfig.js';
export {normalizeMessagesCatalogPaths} from './normalizeExtractorConfig.js';
export {default as unstable_extractMessages} from './extractMessages.js';
export {default as SourceFileFilter} from './source/SourceFileFilter.js';
export {defineCodec} from './format/ExtractorCodec.js';
export {getFormatExtension, resolveCodec} from './format/index.js';
export {
  getDefaultProjectRoot,
  hasLocalesToExtract,
  setNestedProperty,
  throwError,
  warn
} from './utils.js';
export type {
  CatalogLoaderConfig,
  ExtractorConfig,
  ExtractorConfigInput,
  ExtractorMessage,
  ExtractorMessageReference,
  Locale,
  SourceMessage
} from './types.js';
export type {
  BuiltInMessagesFormat,
  MessagesFormat
} from './format/types.js';
export type {default as ExtractorCodec} from './format/ExtractorCodec.js';
