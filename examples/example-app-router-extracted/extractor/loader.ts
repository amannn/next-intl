import type {LoaderContext} from 'webpack';
import {ExtractorConfig} from './catalog/CatalogManager';
import path from 'path';
import ExtractionCompiler from './ExtractionCompiler';

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

  // Check if the file is within the `srcPath`.
  // TODO: Remove this in favor of `conditions` in Next.js 16.
  const srcPath = path.join(cwd, options.srcPath);
  const isWithinSrcPath = !path
    .relative(srcPath, this.resourcePath)
    .startsWith('..');
  if (!isWithinSrcPath) return source;

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
