import path from 'path';
import type {LoaderContext} from 'webpack';
import ExtractionCompiler from '../ExtractionCompiler.js';
import SourceFileFilter from '../source/SourceFileFilter.js';
import type {ExtractorConfig} from '../types.js';

// This instance:
// - Remains available through HMR
// - Is the same across react-client and react-server
// - Is only lost when the dev server restarts (e.g. due to change to Next.js config)
let compiler: ExtractionCompiler | undefined;

// Cache computation
let srcPaths: Array<string> | undefined;

export default function extractMessagesLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const options = this.getOptions();

  if (!srcPaths) {
    srcPaths = (
      Array.isArray(options.srcPath) ? options.srcPath : [options.srcPath]
    ).map((srcPath) => path.join(process.cwd(), srcPath));
  }

  // Check if the file is within any of the `srcPath`s.
  // TODO: Remove this in favor of `conditions` in Next.js 16.
  // In this case we can also use `content: /useExtracted/`
  if (!SourceFileFilter.shouldProcessFile(this.resourcePath, srcPaths)) {
    return source;
  }

  if (!compiler) {
    compiler = new ExtractionCompiler(options);
  }

  const callback = this.async();

  compiler
    .compile(this.resourcePath, source)
    .then((result) => {
      callback(null, result);
    })
    .catch(callback);
}

// Only a subset of the LoaderContext is available in Turbopack
type TurbopackLoaderContext<Options> = Pick<
  LoaderContext<Options>,
  | 'rootContext'
  | 'sourceMap'
  | 'getOptions'
  | 'getResolve'
  | 'emitWarning'
  | 'emitError'
  | 'getLogger'
  | 'context'
  | 'loaderIndex'
  | 'loaders'
  | 'resourcePath'
  | 'resourceQuery'
  | 'resourceFragment'
  | 'async'
  | 'callback'
  | 'cacheable'
  | 'addDependency'
  | 'dependency'
  | 'addContextDependency'
  | 'addMissingDependency'
  | 'getDependencies'
  | 'getContextDependencies'
  | 'getMissingDependencies'
  | 'clearDependencies'
  | 'resource'
  | 'request'
  | 'remainingRequest'
  | 'currentRequest'
  | 'previousRequest'
  | 'query'
  | 'data'
>;
