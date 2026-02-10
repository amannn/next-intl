import type {LoaderContext} from 'webpack';
import type {MessagesFormat} from '../extractor/format/types.js';

export type PluginConfig = {
  requestConfig?: string;
  experimental?: {
    /** A path to the messages file that you'd like to create a declaration for. In case you want to consider multiple files, you can pass an array of paths. */
    createMessagesDeclaration?: string | Array<string>;

    /** Relative path(s) to your source files, to be used in combination with `extract` and `messages`. */
    srcPath?: string | Array<string>;

    /** Enables background tree-shaking analysis that writes a manifest to .next/next-intl. */
    treeShaking?: boolean;

    /** Configuration about your catalogs of messages, to be used in combination with `srcPath` and `extract`. */
    messages?: {
      /** Relative path to the directory containing your messages. */
      path: string;
      /** Defines the format for how your messages are stored. */
      format: MessagesFormat;
      /** Either automatically infer the locales based on catalog files in `path` or explicitly define them. */
      locales: 'infer' | ReadonlyArray<string>;
      /**
       * When enabled, ICU messages are precompiled at build time, resulting in smaller bundles and faster message formatting.
       */
      precompile?: boolean;
    };

    /** Enables the usage of `useExtracted`, to be used in combination with `srcPath` and `messages`. */
    extract?: {
      sourceLocale: string;
    };
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
