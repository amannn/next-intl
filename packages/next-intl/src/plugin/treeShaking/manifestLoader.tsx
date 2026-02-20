/* eslint-disable @typescript-eslint/no-unnecessary-condition -- Loader context varies (webpack/turbopack) */
import path from 'path';
import type {TurbopackLoaderContext} from '../types.js';
import {
  buildInferredManifest,
  createSrcMatcher
} from './buildInferredManifest.js';
import {PROVIDER_NAME, injectManifestProp} from './injectManifest.js';
import type {ManifestLoaderConfig} from './manifestLoaderConfig.js';

export default async function manifestLoader(
  this: TurbopackLoaderContext<ManifestLoaderConfig>,
  source: string
): Promise<string | void> {
  const callback = this.async?.();
  const inputFile = this.resourcePath;
  const rootContext = this.rootContext ?? process.cwd();

  const hasInferProvider =
    /messages\s*=\s*["']infer["']|messages\s*=\s*\{\s*["']infer["']\s*\}/.test(
      source
    ) && new RegExp(PROVIDER_NAME).test(source);
  if (!hasInferProvider) {
    callback?.(null, source);
    return source;
  }

  const options = (this.getOptions?.() ?? {}) as Partial<ManifestLoaderConfig>;
  const srcPaths = options.srcPaths;
  const projectRoot = options.projectRoot ?? rootContext;
  if (!srcPaths || !Array.isArray(srcPaths)) {
    callback?.(null, source);
    return source;
  }

  const srcMatcher = createSrcMatcher(projectRoot, srcPaths);
  if (!srcMatcher.matches(inputFile)) {
    callback?.(null, source);
    return source;
  }

  try {
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    const {graph, namespaces} = await buildInferredManifest(
      inputFile,
      projectRoot,
      srcMatcher,
      tsconfigPath
    );

    for (const filePath of graph.files) {
      this.addDependency?.(filePath);
    }

    const hasNamespaces =
      namespaces === true ||
      (typeof namespaces === 'object' && Object.keys(namespaces).length > 0);
    if (!hasNamespaces) {
      callback?.(null, source);
      return source;
    }

    const {code, map} = injectManifestProp(source, namespaces, inputFile);
    callback?.(null, code, map ?? undefined);
    return code;
  } catch (error) {
    callback?.(error as Error);
    throw error;
  }
}
