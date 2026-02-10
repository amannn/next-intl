import fs from 'fs/promises';
import path from 'path';
import {subscribeSharedSourceWatcher} from '../watcher/SharedSourceWatcher.js';
import {analyze} from './Analyzer.js';
import {createEmptyManifest, writeManifest} from './Manifest.js';

type StartParams = {
  projectRoot: string;
  srcPaths: Array<string>;
};

async function resolveAppDirs(projectRoot: string, srcPaths: Array<string>) {
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
    // Fallback: if srcPath already points to app/, accept it
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

async function runAnalysis(projectRoot: string, appDirs: Array<string>) {
  if (appDirs.length === 0) {
    return;
  }

  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  const manifest = await analyze({appDirs, projectRoot, tsconfigPath});
  await writeManifest(manifest, projectRoot);
}

function appDirsForEvents(
  events: Array<{path: string}>,
  appDirs: Array<string>
): Array<string> {
  const set = new Set<string>();
  for (const event of events) {
    for (const dir of appDirs) {
      if (event.path.startsWith(dir)) {
        set.add(dir);
      }
    }
  }
  return Array.from(set);
}

export default async function startTreeShakingService({
  projectRoot,
  srcPaths
}: StartParams) {
  const appDirs = await resolveAppDirs(projectRoot, srcPaths);
  if (appDirs.length === 0) {
    return;
  }

  const unsubscribers: Array<() => Promise<void>> = [];

  async function run(targets: Array<string>) {
    try {
      await runAnalysis(projectRoot, targets);
    } catch (error) {
      console.warn(
        `\n[next-intl] Tree-shaking analysis failed: ${
          error instanceof Error ? error.message : String(error)
        }\n`
      );
    }
  }

  // Initial run (fire-and-forget)
  // Ensure manifest file exists so imports resolve even before first analysis.
  await writeManifest(createEmptyManifest(), projectRoot);
  void run(appDirs);

  // Subscribe to changes
  const {unsubscribe} = await subscribeSharedSourceWatcher(async (events) => {
    const relevantAppDirs = appDirsForEvents(events, appDirs);
    if (relevantAppDirs.length === 0) {
      return;
    }
    await runAnalysis(projectRoot, relevantAppDirs);
  });
  unsubscribers.push(unsubscribe);

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
