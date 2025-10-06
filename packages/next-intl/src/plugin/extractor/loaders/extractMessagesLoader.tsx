import path from 'path';
import type {LoaderContext} from 'webpack';
import ExtractionCompiler from '../ExtractionCompiler.js';
import type {ExtractorConfig} from '../types.js';

// This instance:
// - Remains available through HMR
// - Is the same across react-client and react-server
// - Is only lost when the dev server restarts (e.g. due to change to Next.js config)
let compiler: ExtractionCompiler | undefined;

const cwd = process.cwd();

export default function extractMessagesLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const options = this.getOptions();

  // Check if the file is within any of the `srcPath`s.
  // TODO: Remove this in favor of `conditions` in Next.js 16.
  // In this case we can also use `content: /useExtracted/`
  const srcPaths = (
    Array.isArray(options.srcPath) ? options.srcPath : [options.srcPath]
  ).map((srcPath) => path.join(cwd, srcPath));

  const isWithinSrcPath = srcPaths.some(
    (srcPath) => !path.relative(srcPath, this.resourcePath).startsWith('..')
  );
  if (!isWithinSrcPath) return source;

  // Ignore files in node_modules unless explicitly asked for
  const isInNodeModules = this.resourcePath.includes('/node_modules/');
  if (isInNodeModules) {
    const isExplicitlyIncluded = srcPaths.some((srcPath) => {
      const relativePath = path.relative(srcPath, this.resourcePath);
      return (
        !relativePath.startsWith('..') && relativePath.includes('node_modules')
      );
    });
    if (!isExplicitlyIncluded) return source;
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
