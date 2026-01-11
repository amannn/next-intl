// Main entry point - exports both compiler and format
export {compile} from './compiler.js';
export {format} from './format.js';
export type {FormatValues} from './format.js';
export type {
  CompiledMessage,
  CompiledNode,
  FormatResult,
  RichFormatResult
} from './types.js';
