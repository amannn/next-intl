import type {ExtractorConfigInput} from 'intl-extractor';
import type {LoaderContext} from 'webpack';

export type PluginConfig = {
  requestConfig?: string;
  experimental?: {
    /** A path to the messages file that you'd like to create a declaration for. In case you want to consider multiple files, you can pass an array of paths. */
    createMessagesDeclaration?: string | Array<string>;

    /**
     * Relative path(s) to your source code files.
     */
    srcPath?: string | Array<string>;

    /** Configuration about your catalogs of messages */
    messages?: ExtractorConfigInput['messages'] & {
      /**
       * When enabled, ICU messages are precompiled at build time, resulting in smaller bundles and faster message formatting.
       */
      precompile?: boolean;
    };

    /**
     * Enables the usage of [`useExtracted`](/docs/usage/extraction).
     */
    extract?: ExtractorConfigInput['extract'];

    /**
     * Absolute base path used when computing relative paths in catalog
     * references (e.g. `#:` lines in PO). Defaults to the project root
     * (Next.js project directory). Set this to a monorepo root to keep
     * references stable across multiple apps that share a single catalog.
     */
    referenceRoot?: string;
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
