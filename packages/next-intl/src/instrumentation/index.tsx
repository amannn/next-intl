import fs from 'fs';
import path from 'path';

const DEBUG = !!process.env.DEBUG;
const LOG_FILE = 'next-intl.log';

type LogMetadata = Record<string, unknown>;

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatMetadata(metadata?: LogMetadata): string {
  if (!metadata || Object.keys(metadata).length === 0) return '';
  return ' ' + JSON.stringify(metadata);
}

type TimerEntry = {name: string; start: bigint};

export class Instrumentation {
  private logPath = path.resolve(process.cwd(), LOG_FILE);
  private timerStack: Array<TimerEntry> = [];

  public start(name: string): void {
    this.timerStack.push({name, start: process.hrtime.bigint()});
  }

  public end(name: string, metadata?: LogMetadata): void {
    const entry = this.timerStack.pop();
    if (!entry) return;
    if (entry.name !== name) {
      this.timerStack.push(entry);
      throw new Error(
        `[next-intl] Mismatched timer: end("${name}") but expected end("${entry.name}")`
      );
    }

    const elapsed = process.hrtime.bigint() - entry.start;
    const durationMs = Number(elapsed) / 1e6;
    const line = `${formatTimestamp()} [next-intl] ${name} ${durationMs.toFixed(2)}ms${formatMetadata(metadata)}\n`;

    try {
      fs.appendFileSync(this.logPath, line);
    } catch {
      // Ignore write errors; don't break the build
    }
  }
}

const noop = {
  start: () => {},
  end: () => {}
};

export function getInstrumentation(options?: {
  enabled?: boolean;
}): Instrumentation | typeof noop {
  const enabled = options?.enabled ?? DEBUG;
  return enabled ? new Instrumentation() : noop;
}
