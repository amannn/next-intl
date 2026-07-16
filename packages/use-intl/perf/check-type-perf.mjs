#!/usr/bin/env node
/**
 * Compares TypeScript instantiation count between the current branch and a
 * baseline branch for the files listed in TRACKED_FILES.
 *
 * Uses `Instantiations` (not `Total time`) as the primary decision metric
 * because it is deterministic – the same source always produces the same
 * count regardless of CPU load. Time metrics are shown for information only.
 *
 * Usage:
 *   node perf/check-type-perf.mjs [--threshold 1.05] [--base-ref upstream/main]
 *
 * Exit codes:
 *   0 – within threshold (or comparison skipped)
 *   1 – regression detected
 */

import {execSync} from 'node:child_process';
import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

// ── Configuration ─────────────────────────────────────────────────────────────

const thresholdArgIdx = process.argv.indexOf('--threshold');
/** Maximum allowed ratio PR/baseline before the check fails. Default: 5%. */
const THRESHOLD =
  thresholdArgIdx !== -1 ? parseFloat(process.argv[thresholdArgIdx + 1]) : 1.05;

/**
 * Source files (relative to repo root) whose content is swapped to the
 * baseline version for the baseline measurement.
 *
 * Rules:
 *  - Only list files directly exercised by perf test files.
 *  - Unrelated files add noise without improving accuracy.
 *  - Files added or removed in a PR are detected automatically and handled
 *    correctly (see "File lifecycle" section below).
 */
const TRACKED_FILES = [
  'packages/use-intl/src/core/MessageKeys.tsx',
  'packages/use-intl/src/core/createTranslator.tsx',
  'packages/use-intl/src/core/ICUArgs.tsx',
  'packages/use-intl/src/core/ICUTags.tsx'
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_DIR = join(__dirname, '..');
const REPO_ROOT = join(PKG_DIR, '..', '..');

function run(cmd, cwd = PKG_DIR) {
  return execSync(cmd, {
    cwd,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
}

function getFileFromGit(relativePath, ref) {
  try {
    return run(`git show ${ref}:${relativePath}`, REPO_ROOT);
  } catch {
    return null;
  }
}

function parseMetrics(output) {
  const int = (re) => parseInt(output.match(re)?.[1] ?? '0', 10);
  const flt = (re) => parseFloat(output.match(re)?.[1] ?? '0');
  return {
    instantiations: int(/Instantiations:\s+(\d+)/),
    types: int(/Types:\s+(\d+)/),
    checkTime: flt(/Check time:\s+([\d.]+)s/),
    totalTime: flt(/Total time:\s+([\d.]+)s/)
  };
}

function measurePerf() {
  // Run tsc directly and merge stderr into stdout (2>&1) so that
  // --extendedDiagnostics output is captured regardless of which stream tsc
  // uses on a given platform/version.
  const output = execSync(
    'node_modules/.bin/tsc --noEmit --extendedDiagnostics -p tsconfig.perf.json 2>&1',
    {cwd: PKG_DIR, encoding: 'utf-8'}
  );
  return parseMetrics(output);
}

/** Formats a percentage delta with a sign. Returns 'n/a' when the base is zero. */
function fmtDelta(pr, base) {
  if (base === 0) return 'n/a';
  const pct = (((pr - base) / base) * 100).toFixed(1);
  return (pr >= base ? '+' : '') + pct + '%';
}

// ── File lifecycle ────────────────────────────────────────────────────────────
//
// Each tracked file falls into one of four lifecycle states:
//
//  'changed'  – present in both baseline and PR; can be cleanly swapped.
//  'added'    – new in PR, absent in baseline. Both measurements use the PR
//               version, so the file's overhead cancels out in the delta.
//               A warning is printed so the author is aware.
//  'deleted'  – removed in PR, present in baseline. The baseline measurement
//               writes the baseline content; the PR measurement deletes the
//               file so tsc sees the correct PR state.
//  'absent'   – exists in neither; should not happen in practice.

function resolveBaseRef() {
  const flagIdx = process.argv.indexOf('--base-ref');
  if (flagIdx !== -1) return process.argv[flagIdx + 1];
  if (process.env.PERF_BASE_REF) return process.env.PERF_BASE_REF;
  if (process.env.GITHUB_BASE_REF)
    return `origin/${process.env.GITHUB_BASE_REF}`;
  try {
    run('git rev-parse upstream/main', REPO_ROOT);
    return 'upstream/main';
  } catch {
    return 'origin/main';
  }
}

const baseRef = resolveBaseRef();

const entries = TRACKED_FILES.map((rel) => {
  const abs = join(REPO_ROOT, rel);
  const prContent = existsSync(abs) ? readFileSync(abs, 'utf-8') : null;
  const baseContent = getFileFromGit(rel, baseRef);
  const status =
    prContent !== null && baseContent !== null
      ? 'changed'
      : prContent !== null
        ? 'added'
        : baseContent !== null
          ? 'deleted'
          : 'absent';

  return {rel, abs, prContent, baseContent, status};
});

// Warn about lifecycle anomalies before starting measurements.
const added = entries.filter((e) => e.status === 'added');
const deleted = entries.filter((e) => e.status === 'deleted');

if (added.length > 0) {
  console.log(
    `\nNote: these tracked files are new (not in ${baseRef}).\n` +
      `Both measurements use the PR version, so their overhead cancels out:\n` +
      added.map((e) => `  + ${e.rel}`).join('\n')
  );
}
if (deleted.length > 0) {
  console.log(
    `\nNote: these tracked files were removed in this PR.\n` +
      `The baseline measurement will temporarily restore them:\n` +
      deleted.map((e) => `  - ${e.rel}`).join('\n')
  );
}

const hasAnythingToCompare = entries.some(
  (e) => e.status === 'changed' || e.status === 'deleted'
);
if (!hasAnythingToCompare) {
  console.log(`\nNo comparable tracked files found on ${baseRef} – skipping.`);
  process.exit(0);
}

// ── Swap helpers ──────────────────────────────────────────────────────────────

function applyBaseline() {
  for (const {abs, baseContent, status} of entries) {
    // 'changed': replace PR content with baseline content.
    // 'deleted': write baseline content so tsc can resolve imports.
    if (status === 'changed' || status === 'deleted') {
      writeFileSync(abs, baseContent, 'utf-8');
    }
    // 'added': leave PR content in place – we have no baseline to swap to.
  }
}

function applyPR() {
  for (const {abs, prContent, status} of entries) {
    if (status === 'changed') {
      writeFileSync(abs, prContent, 'utf-8');
    } else if (status === 'deleted') {
      // The file does not exist in the PR; remove the baseline copy we wrote.
      if (existsSync(abs)) rmSync(abs);
    }
    // 'added': PR content is already on disk – nothing to do.
  }
}

// ── Measure ───────────────────────────────────────────────────────────────────

let baseMetrics;
let prMetrics;

try {
  console.log(`\nMeasuring baseline (${baseRef})…`);
  applyBaseline();
  baseMetrics = measurePerf();

  console.log('Measuring PR branch…');
  applyPR();
  prMetrics = measurePerf();
} catch (err) {
  applyPR(); // always restore working-tree state on error
  throw err;
}

// ── Report ────────────────────────────────────────────────────────────────────

const col = (val) => String(val).padEnd(14);
const row = (label, base, pr) =>
  `│ ${label.padEnd(18)} │ ${col(base)} │ ${col(pr)} │ ${fmtDelta(pr, base).padEnd(8)}`;

const baseLabel = baseRef.padEnd(14);
console.log(`
┌─ Type-check performance ──────────────────────────────────────────┐
│ Metric             │ ${baseLabel} │ PR             │ Δ
├────────────────────┼────────────────┼────────────────┼────────────
${row('Instantiations', baseMetrics.instantiations, prMetrics.instantiations)}
${row('Types', baseMetrics.types, prMetrics.types)}
${row('Check time (s)', baseMetrics.checkTime, prMetrics.checkTime)} *
${row('Total time (s)', baseMetrics.totalTime, prMetrics.totalTime)} *
└───────────────────────────────────────────────────────────────────┘
  * time metrics are noisy; pass/fail is based on Instantiations only.
`);

// ── Decision ──────────────────────────────────────────────────────────────────

const instDelta = fmtDelta(
  prMetrics.instantiations,
  baseMetrics.instantiations
);
const thresholdPct = ((THRESHOLD - 1) * 100).toFixed(0);

if (prMetrics.instantiations / (baseMetrics.instantiations || 1) > THRESHOLD) {
  console.error(
    `[FAIL] Instantiations grew by ${instDelta} (threshold: +${thresholdPct}%).\n` +
      `       Optimise the type or raise THRESHOLD in check-type-perf.mjs if intentional.`
  );
  process.exit(1);
}

console.log(
  `[PASS] Instantiation change ${instDelta} is within the +${thresholdPct}% threshold.`
);
