import type {LoaderContext} from 'webpack';
import type {ExtractorConfigInput} from '../extractor/types.js';

export type PluginConfig = {
  requestConfig?: string;
  experimental?: {
    /** A path to the messages file that you'd like to create a declaration for. In case you want to consider multiple files, you can pass an array of paths. */
    createMessagesDeclaration?: string | Array<string>;

    /** @deprecated Use `extract.srcPath`. */
    srcPath?: string | Array<string>;

    /** Configuration about your catalogs of messages */
    messages?: ExtractorConfigInput['messages'] & {
      /**
       * When enabled, ICU messages are precompiled at build time, resulting in smaller bundles and faster message formatting.
       */
      precompile?: boolean;
    };

    /** Enables the usage of `useExtracted`, to be used in combination with `messages`. */
    extract?: NonNullable<ExtractorConfigInput['extract']>;
  };
};

// Only a subset of the LoaderContext is available in Turbopack
export type TurbopackLoaderContext<Options> = Pick<
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
