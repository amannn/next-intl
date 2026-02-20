import fs from 'fs';
import path from 'path';

/** Set NEXT_INTL_EXTRACT_DEBUG=1 to enable. Writes to next-intl-extractor.log in project root. */
const LOG_ENABLED = process.env.NEXT_INTL_EXTRACT_DEBUG === '1';
const LOG_FILE = 'next-intl-extractor.log';

let logPath: string | null = null;
let sessionLogged = false;

function getLogPath(projectRoot: string): string {
  if (!logPath) {
    logPath = path.join(projectRoot, LOG_FILE);
  }
  return logPath;
}

function logSessionStart(projectRoot: string) {
  if (!sessionLogged) {
    sessionLogged = true;
    write(
      projectRoot,
      'SESSION',
      '=== next-intl extractor logging started ===',
      {
        pid: process.pid,
        cwd: process.cwd(),
        goal1:
          'addContextDependency: invalidate when files added/changed/removed',
        goal2: 'HMR batching: one loader run = one extraction',
        goal3: 'Source-locale-only: only source catalog triggers extraction'
      }
    );
  }
}

function timestamp(): string {
  return new Date().toISOString();
}

function write(
  projectRoot: string,
  level: string,
  message: string,
  data?: object
) {
  if (!LOG_ENABLED) return;
  logSessionStart(projectRoot);
  try {
    const filePath = getLogPath(projectRoot);
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    const line = `[${timestamp()}] [${level}] ${message}${dataStr}\n`;
    fs.appendFileSync(filePath, line);
  } catch {
    // Ignore write errors
  }
}

export type ExtractorLogger = {
  catalogLoaderRun(params: {
    projectRoot: string;
    resourcePath: string;
    locale: string;
    isSourceLocale: boolean;
    runExtraction: boolean;
    srcPaths: Array<string>;
  }): void;
  addContextDependency(params: {projectRoot: string; path: string}): void;
  extractionStart(params: {projectRoot: string; resourcePath: string}): void;
  extractionEnd(params: {
    projectRoot: string;
    resourcePath: string;
    durationMs: number;
  }): void;
  catalogManagerLoadStart(params: {projectRoot: string}): void;
  catalogManagerScanComplete(params: {
    projectRoot: string;
    fileCount: number;
    messageCount: number;
    durationMs: number;
  }): void;
  catalogManagerFileProcessed(params: {
    projectRoot: string;
    filePath: string;
    messageCount: number;
    changed: boolean;
  }): void;
  catalogManagerSaveStart(params: {projectRoot: string}): void;
  catalogManagerSaveComplete(params: {
    projectRoot: string;
    localesWritten: Array<string>;
    durationMs: number;
  }): void;
  initExtractionSkipped(params: {reason: string}): void;
  initExtractionRun(params: {projectRoot: string}): void;
};

export const extractorLogger: ExtractorLogger = {
  catalogLoaderRun({
    isSourceLocale,
    locale,
    projectRoot,
    resourcePath,
    runExtraction,
    srcPaths
  }) {
    write(projectRoot, 'CATALOG_LOADER', 'Loader invoked', {
      resourcePath,
      locale,
      isSourceLocale,
      runExtraction,
      decodeOnly: !runExtraction,
      srcPaths,
      goal: 'Source-locale-only: only source locale runs extraction; target = decode only'
    });
  },

  addContextDependency({path: depPath, projectRoot}) {
    write(projectRoot, 'ADD_CONTEXT_DEP', 'addContextDependency called', {
      path: depPath,
      goal: 'Invalidation: files added/changed/removed in this path will re-run loader'
    });
  },

  extractionStart({projectRoot, resourcePath}) {
    write(projectRoot, 'EXTRACTION', 'Extraction started', {
      resourcePath,
      goal: 'Full project scan + merge + save'
    });
  },

  extractionEnd({durationMs, projectRoot, resourcePath}) {
    write(projectRoot, 'EXTRACTION', 'Extraction completed', {
      resourcePath,
      durationMs,
      goal: 'HMR batching: one loader run = one extraction = one batched write'
    });
  },

  catalogManagerLoadStart({projectRoot}) {
    write(projectRoot, 'CATALOG_MANAGER', 'loadMessages started', {
      goal: 'Loading catalogs + scanning source files'
    });
  },

  catalogManagerScanComplete({
    durationMs,
    fileCount,
    messageCount,
    projectRoot
  }) {
    write(projectRoot, 'CATALOG_MANAGER', 'Scan complete', {
      fileCount,
      messageCount,
      durationMs
    });
  },

  catalogManagerFileProcessed({changed, filePath, messageCount, projectRoot}) {
    write(projectRoot, 'CATALOG_MANAGER', 'File processed', {
      filePath,
      messageCount,
      changed
    });
  },

  catalogManagerSaveStart({projectRoot}) {
    write(projectRoot, 'CATALOG_MANAGER', 'save started', {
      goal: 'Writing all locale catalogs'
    });
  },

  catalogManagerSaveComplete({durationMs, localesWritten, projectRoot}) {
    write(projectRoot, 'CATALOG_MANAGER', 'save completed', {
      localesWritten,
      durationMs
    });
  },

  initExtractionSkipped({reason}) {
    const projectRoot = process.cwd();
    write(projectRoot, 'INIT', 'initExtractionCompiler skipped', {
      reason,
      goal: 'Dev: loader handles extraction; Build: runs once'
    });
  },

  initExtractionRun({projectRoot}) {
    write(projectRoot, 'INIT', 'initExtractionCompiler running extractAll', {
      goal: 'Build: one-time extraction before build'
    });
  }
};
