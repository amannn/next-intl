import path from 'path';
import {readdir} from 'fs/promises';

export type ExtractorConfigInput = {
  sourceLocale: string;
  messagesPath: string;
  srcPath: string;
  formatter: 'json';
};

const formatters = {
  json: () => import('./formatters/JSONFormatter.ts')
};

export default class ExtractorConfig {
  static async loadConfig(input: ExtractorConfigInput) {
    const projectRoot = this.getProjectRoot();
    const srcPath = path.join(projectRoot, input.srcPath);
    const messagesDir = path.join(projectRoot, input.messagesPath);

    const FormatterImpl = (await formatters[input.formatter]()).default;
    const formatter = new FormatterImpl(messagesDir, input.sourceLocale);

    const targetLocales = await this.getTargetLocales(
      messagesDir,
      FormatterImpl.EXTENSION,
      input.sourceLocale
    );

    return {
      srcPath,
      targetLocales,
      formatter
    };
  }

  private static getProjectRoot() {
    return process.cwd();
  }

  private static async getTargetLocales(
    messagesDir: string,
    extension: string,
    sourceLocale: string
  ) {
    const files = await readdir(messagesDir);
    return files
      .filter((file) => file.endsWith(extension))
      .map((file) => path.basename(file, extension))
      .filter((locale) => locale !== sourceLocale);
  }
}
