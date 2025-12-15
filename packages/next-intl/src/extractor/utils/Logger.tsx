import fs from 'fs';
import path from 'path';

export default class Logger {
  private logPath?: string;
  private projectRoot: string;
  private enabled: boolean;
  private prefix?: string;

  public constructor(
    logPath: string | undefined,
    projectRoot: string,
    prefix?: string
  ) {
    this.logPath = logPath;
    this.projectRoot = projectRoot;
    this.enabled = !!logPath;
    this.prefix = prefix;
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  private formatMessage(
    level: string,
    message: string,
    data?: unknown
  ): string {
    const timestamp = this.getTimestamp();
    const prefixStr = this.prefix ? `[${this.prefix}] ` : '';
    const dataStr = data !== undefined ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] ${prefixStr}${message}${dataStr}\n`;
  }

  private async write(
    level: string,
    message: string,
    data?: unknown
  ): Promise<void> {
    if (!this.enabled || !this.logPath) return;

    try {
      const fullPath = path.isAbsolute(this.logPath)
        ? this.logPath
        : path.join(this.projectRoot, this.logPath);
      const logMessage = this.formatMessage(level, message, data);
      await fs.promises.appendFile(fullPath, logMessage, 'utf8');
    } catch (error) {
      // Silently fail to avoid breaking the extraction process
      console.error(`Failed to write debug log: ${error}`);
    }
  }

  public async info(message: string, data?: unknown): Promise<void> {
    await this.write('INFO', message, data);
  }

  public async debug(message: string, data?: unknown): Promise<void> {
    await this.write('DEBUG', message, data);
  }

  public async warn(message: string, data?: unknown): Promise<void> {
    await this.write('WARN', message, data);
  }

  public async error(message: string, data?: unknown): Promise<void> {
    await this.write('ERROR', message, data);
  }

  public async timeStart(label: string): Promise<void> {
    await this.info(`TIMER_START: ${label}`);
  }

  public async timeEnd(label: string, duration?: number): Promise<void> {
    const data = duration !== undefined ? {durationMs: duration} : undefined;
    await this.info(`TIMER_END: ${label}`, data);
  }

  public createChild(prefix: string): Logger {
    return new Logger(this.logPath, this.projectRoot, prefix);
  }
}
