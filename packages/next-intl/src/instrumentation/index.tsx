import fs from 'fs';
import path from 'path';

const DURATION_WIDTH = 9;

function formatDuration(ms: number): string {
  return `[${(ms.toFixed(2) + 'ms').padStart(DURATION_WIDTH)}]`;
}

type TimerEntry = {name: string; start: bigint};

type BufferedEntry = {line: string; start: bigint};

export default class Instrumentation implements Disposable {
  private static instance: Instrumentation | null = null;

  private logPath = path.resolve(process.cwd(), 'next-intl.log');
  private timerStack: Array<TimerEntry> = [];
  private logBuffer: Array<BufferedEntry> = [];
  private enabled = !!process.env.DEBUG;

  public constructor() {
    if (Instrumentation.instance !== null) {
      return Instrumentation.instance as unknown as this;
    }
    Instrumentation.instance = this;
  }

  public start(name: string): void {
    if (!this.enabled) return;
    this.timerStack.push({name, start: process.hrtime.bigint()});
  }

  public end(name: string, metadata?: string): void {
    if (!this.enabled) return;
    const depth = this.timerStack.length - 1;
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
    const duration = formatDuration(durationMs);
    const prefix = depth === 0 ? '' : '  '.repeat(depth) + '↳ ';
    let line = `${duration} ${prefix}${name}`;
    if (metadata) {
      line += ` — ${metadata}`;
    }
    line += '\n';
    this.logBuffer.push({line, start: entry.start});
    if (this.timerStack.length === 0) this.flush();
  }

  public [Symbol.dispose](): void {}

  private flush(): void {
    if (!this.enabled || this.logBuffer.length === 0) return;
    try {
      const sorted = [...this.logBuffer].sort((a, b) =>
        Number(a.start - b.start)
      );
      fs.appendFileSync(
        this.logPath,
        sorted.map((entry) => entry.line).join('')
      );
      this.logBuffer.length = 0;
    } catch {
      // Ignore write errors; don't break the build
    }
  }
}
