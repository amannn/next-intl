import fs from 'fs/promises';
import path from 'path';
import SourceFileFilter from '../extractor/source/SourceFileFilter.js';
import {isDevelopment} from '../plugin/config.js';
import {subscribeSharedSourceWatcher} from '../watcher/SharedSourceWatcher.js';
import TreeShakingAnalyzer from './Analyzer.js';
import {createEmptyManifest, writeManifest} from './Manifest.js';

type StartParams = {
  projectRoot: string;
  srcPaths: Array<string>;
};

async function resolveAppDirs(
  projectRoot: string,
  srcPaths: Array<string>
): Promise<Array<string>> {
  const appDirs: Array<string> = [];
  for (const srcPath of srcPaths) {
    const absSrc = path.resolve(projectRoot, srcPath);
    const candidate = path.join(absSrc, 'app');
    try {
      const stats = await fs.stat(candidate);
      if (stats.isDirectory()) {
        appDirs.push(candidate);
        continue;
      }
    } catch {
      // ignore
    }
    try {
      const stats = await fs.stat(absSrc);
      if (stats.isDirectory() && path.basename(absSrc) === 'app') {
        appDirs.push(absSrc);
      }
    } catch {
      // ignore
    }
  }
  return appDirs;
}

function filterChangedFiles(
  events: Array<{path: string}>,
  appDirs: Array<string>
): Array<string> {
  const matches = new Set<string>();
  for (const event of events) {
    for (const appDir of appDirs) {
      if (SourceFileFilter.isWithinPath(event.path, appDir)) {
        matches.add(path.resolve(event.path));
        break;
      }
    }
  }
  return Array.from(matches);
}

export default async function startTreeShakingService({
  projectRoot,
  srcPaths
}: StartParams) {
  const appDirs = await resolveAppDirs(projectRoot, srcPaths);
  if (appDirs.length === 0) {
    return;
  }

  const analyzer = new TreeShakingAnalyzer({
    projectRoot,
    srcPaths,
    tsconfigPath: path.join(projectRoot, 'tsconfig.json')
  });

  await writeManifest(createEmptyManifest(), projectRoot);

  async function run(changedFiles?: Array<string>) {
    try {
      const manifest = await analyzer.analyze({appDirs, changedFiles});
      await writeManifest(manifest, projectRoot);
    } catch (error) {
      console.warn(
        `\n[next-intl] Tree-shaking analysis failed: ${
          error instanceof Error ? error.message : String(error)
        }\n`
      );
    }
  }

  const unsubscribers: Array<() => Promise<void>> = [];

  if (isDevelopment) {
    void run();
    const {unsubscribe} = await subscribeSharedSourceWatcher(async (events) => {
      const changedFiles = filterChangedFiles(events, appDirs);
      if (changedFiles.length === 0) return;
      await run(changedFiles);
    });
    unsubscribers.push(unsubscribe);
  } else {
    await run();
  }

  async function cleanup() {
    await Promise.all(unsubscribers.map((fn) => fn()));
  }

  process.on('exit', () => {
    void cleanup();
  });
  process.on('SIGINT', () => {
    void cleanup();
  });
  process.on('SIGTERM', () => {
    void cleanup();
  });
}
