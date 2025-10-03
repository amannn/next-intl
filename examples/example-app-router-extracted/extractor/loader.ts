import type {LoaderContext} from 'webpack';
import CatalogManager, {ExtractorConfig} from './catalog/CatalogManager';
import {ExtractedMessage} from './types';
import path from 'path';

// This instance:
// - Remains available through HMR
// - Is the same across react-client and react-server
let manager: CatalogManager;

function haveMessagesChanged(
  messages1: Map<string, ExtractedMessage> | undefined,
  messages2: Map<string, ExtractedMessage> | undefined
): boolean {
  // If one exists and the other doesn't, there's a change
  if (!messages1 || !messages2) {
    return messages1 !== messages2;
  }

  // Different sizes means changes
  if (messages1.size !== messages2.size) {
    return true;
  }

  // Check differences in messages1 vs messages2
  for (const [id, msg1] of messages1) {
    const msg2 = messages2.get(id);
    if (!msg2 || msg1.message !== msg2.message) {
      return true; // Early exit on first difference
    }
  }

  return false;
}

// We only want to emit messages continuously in development.
// In production, we can do a single extraction pass.
const isDevelopment = process.env.NODE_ENV === 'development';

async function compile(
  resourcePath: string,
  source: string,
  config: ExtractorConfig
) {
  // Lazy init
  if (!manager) {
    manager = new CatalogManager(config);

    // We can't rely on all files being compiled (e.g. due to persistent
    // caching), so loading the messages initially is necessary.
    await manager.loadMessages();

    await manager.save();
    // messages after the first pass (but: keep AST modification)
  }

  // Get messages before extraction
  const beforeMessages = manager.getFileMessages(resourcePath);

  // Extract messages
  const result = await manager.extractFileMessages(
    resourcePath,
    source,
    isDevelopment ? 'both' : 'transform'
  );
  console.log(`   Extracted ${result.messages.length} message(s)`);

  // Get messages after extraction
  const afterMessages = manager.getFileMessages(resourcePath);

  // Check if messages changed
  const changed = haveMessagesChanged(beforeMessages, afterMessages);

  if (isDevelopment && changed) {
    console.log(`   Messages changed`);
    void manager.save();
  }

  return result.source;
}

const cwd = process.cwd();

export default function extractMessagesLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const options = this.getOptions();

  // Check if the file is within the `srcPath`
  const srcPath = path.join(cwd, options.srcPath);
  const isWithinSrcPath =
    path.relative(srcPath, this.resourcePath).startsWith('..') === false;
  if (!isWithinSrcPath) {
    return source;
  }

  const callback = this.async();

  compile(this.resourcePath, source, options)
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
